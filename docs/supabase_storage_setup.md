# Supabase Storage Setup & Configuration Guide

This guide documents the setup, bucket creation, folder structure, MIME types, file size guidelines, CORS configuration, and verification protocols for the public `downloads` storage bucket in Supabase.

---

## 1. Bucket Creation & RLS Policy

The `downloads` bucket stores downloadable build assets (Android APK, Windows Desktop EXE, Chrome Extension ZIP) for Bug Tracker Lite.

### SQL DDL
Execute the following SQL in your Supabase SQL Editor or migration scripts (`supabase_schema.sql`):

```sql
-- Create Public Storage Bucket for Downloads
INSERT INTO storage.buckets (id, name, public)
VALUES ('downloads', 'downloads', true)
ON CONFLICT (id) DO NOTHING;

-- Grant Public Read Access Policy
DROP POLICY IF EXISTS "Downloads Public Read Access" ON storage.objects;
CREATE POLICY "Downloads Public Read Access" 
  ON storage.objects 
  FOR SELECT 
  TO public 
  USING ( bucket_id = 'downloads' );
```

Key Details:
- **Bucket ID**: `downloads`
- **Bucket Name**: `downloads`
- **Public**: `true` (enables direct public URL access without user authentication)
- **RLS Policy**: `"Downloads Public Read Access"` permits anonymous/public `SELECT` queries on `storage.objects` where `bucket_id = 'downloads'`.

---

## 2. Folder Structure

The `downloads` bucket organizes binary assets under the `builds/` prefix:

```
downloads/
└── builds/
    ├── Android.apk
    ├── Desktop.exe
    └── ChromeExtension.zip
```

### File Details
| File Path | Target Platform | Description | Expected Size |
|---|---|---|---|
| `builds/Android.apk` | Android Mobile App | Native mobile application package | ~48 MB |
| `builds/Desktop.exe` | Windows Desktop App | Native desktop installer executable | ~75 MB |
| `builds/ChromeExtension.zip` | Chrome Extension | Web extension package (zipped) | ~12 MB |

---

## 3. MIME Types & File Size Guidelines

To ensure proper browser download behavior and prevent security issues or corrupted downloads, set appropriate MIME types upon upload.

### MIME Type Mapping
- **`builds/Android.apk`**: `application/vnd.android.package-archive`
- **`builds/Desktop.exe`**: `application/x-msdownload` (or `application/octet-stream`)
- **`builds/ChromeExtension.zip`**: `application/zip` (or `application/x-zip-compressed`)

### File Size Limits & Guidelines
- **Global Bucket Limit**: 100 MB per file recommendation.
- **Recommended Thresholds**:
  - `Android.apk`: 50 MB max
  - `Desktop.exe`: 100 MB max
  - `ChromeExtension.zip`: 25 MB max

---

## 4. CORS Configuration

Cross-Origin Resource Sharing (CORS) must be configured on Supabase Storage to allow client applications (e.g., Next.js frontend running on `http://localhost:3000` or production domain) to fetch or download binary files directly.

### Method A: Supabase Dashboard UI
1. Log into the **Supabase Dashboard**.
2. Select your project and navigate to **Project Settings** -> **Storage**.
3. Under **CORS Configuration**, add or edit rules for the `downloads` bucket:
   - **Allowed Origins**: `*` (or specific domain `https://your-domain.com`)
   - **Allowed Methods**: `GET`, `HEAD`, `OPTIONS`
   - **Allowed Headers**: `*`
   - **Max Age (seconds)**: `3600`

### Method B: Supabase CLI (`supabase/config.toml`)
If running Supabase locally using the Supabase CLI, add the bucket config in `supabase/config.toml`:

```toml
[storage.buckets.downloads]
public = true
file_size_limit = "100MiB"
allowed_mime_types = [
  "application/vnd.android.package-archive",
  "application/x-msdownload",
  "application/zip"
]
```

---

## 5. Verification Protocols

### A. SQL Query Verification
Verify that the `downloads` bucket and RLS policies exist in Supabase:

```sql
-- Verify bucket exists and is public
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'downloads';

-- Verify RLS policy is attached
SELECT policyname, tablename, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname = 'Downloads Public Read Access';
```

### B. JS Client Verification
Test public URL generation using `@supabase/supabase-js` client SDK:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Retrieve public URL for Android APK
const { data } = supabase.storage
  .from('downloads')
  .getPublicUrl('builds/Android.apk');

console.log('Android APK Public URL:', data.publicUrl);
// Example output: https://<project>.supabase.co/storage/v1/object/public/downloads/builds/Android.apk
```

### C. HTTP curl Verification

#### 1. Test Public File Fetch (GET)
```bash
curl -I "https://<PROJECT_REF>.supabase.co/storage/v1/object/public/downloads/builds/Android.apk"
```
Expected output:
```http
HTTP/2 200
content-type: application/vnd.android.package-archive
access-control-allow-origin: *
```

#### 2. Test CORS Preflight Request (OPTIONS)
```bash
curl -i -X OPTIONS "https://<PROJECT_REF>.supabase.co/storage/v1/object/public/downloads/builds/Android.apk" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"
```
Expected output:
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: *
```
