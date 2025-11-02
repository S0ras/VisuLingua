# VisuLingua - Sicherheitseinrichtung

## Problem
Aktuell kann sich jeder bei der App anmelden, ohne E-Mail-Bestätigung.

## Lösung 1: E-Mail-Bestätigung aktivieren (EMPFOHLEN) ✅

### In Supabase Dashboard:
1. Gehe zu https://supabase.com/dashboard/project/ckzyjtgawccszkbpblfi
2. Klicke auf **Authentication** → **Settings** 
3. Unter **Email Settings**:
   - ✅ Aktiviere **"Enable email confirmations"**
   - Setze **"Confirm email"** auf **Required**
4. Speichern

### Ergebnis:
- User bekommen eine Bestätigungs-E-Mail
- Ohne Bestätigung können sie sich nicht einloggen
- Verhindert Spam-Registrierungen

## Lösung 2: Invite-Only System

Wenn du nur bestimmte Personen zulassen willst:

### In Supabase Dashboard:
1. Gehe zu **Authentication** → **Settings**
2. Unter **Auth Settings**:
   - ✅ Deaktiviere **"Enable sign ups"**
3. User müssen dann per Invite eingeladen werden

### Um User manuell einzuladen:
```sql
-- Im Supabase SQL Editor ausführen
SELECT auth.invite_user_by_email('user@example.com');
```

## Lösung 3: Domain-Einschränkung

Nur bestimmte E-Mail-Domains erlauben (z.B. nur @deine-firma.de):

```sql
-- In Supabase SQL Editor ausführen
CREATE OR REPLACE FUNCTION public.check_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@deine-firma.de' THEN
    RAISE EXCEPTION 'Only company email addresses are allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_email_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION check_email_domain();
```

## Lösung 4: Amplify - Domain-Einschränkung

### In AWS Amplify Console:
1. Gehe zu deiner App: https://console.aws.amazon.com/amplify
2. Klicke auf **Access control**
3. Füge **Basic Auth** oder **IP-Whitelist** hinzu

## Empfehlung für deine App:

**Start:** E-Mail-Bestätigung aktivieren (Lösung 1)
- Einfach
- Keine Code-Änderungen nötig
- Verhindert Spam

**Später:** Wenn du mehr Kontrolle brauchst:
- Invite-Only System (Lösung 2)
- Oder Domain-Einschränkung (Lösung 3)

## Aktuelle Amplify URL
Deine App ist erreichbar unter:
- `https://main.xxxxx.amplifyapp.com` (öffentlich)

Jeder mit der URL kann die App sehen und sich registrieren (solange Sign-Ups aktiviert sind).

## Zusätzliche Sicherheitsmaßnahmen:

### 1. Rate Limiting in Supabase
Verhindert Brute-Force-Angriffe:
- Ist standardmäßig aktiviert
- Check: Authentication → Rate Limits

### 2. RLS (Row Level Security)
✅ Bereits implementiert in deiner App!
- User sehen nur ihre eigenen Daten
- Definiert in `supabase-schema.sql`

### 3. CORS Einschränkungen
Nur von deiner Domain aus zugreifen:
- In Supabase: Settings → API → CORS
- Setze auf: `https://main.xxxxx.amplifyapp.com`

## Monitoring
Überwache Registrierungen:
1. Supabase Dashboard → Authentication → Users
2. Sieh wer sich anmeldet
3. Lösche unerwünschte User manuell
