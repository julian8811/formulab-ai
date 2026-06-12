# Supabase Storage — `ingredient-documents`

Bucket para fichas técnicas, SDS, COA y otros documentos de ingredientes.

## Crear el bucket

1. Abre el [Dashboard de Supabase](https://supabase.com/dashboard) → tu proyecto → **Storage**.
2. **New bucket**
   - Name: `ingredient-documents`
   - Public: **off** (privado; acceso vía signed URLs o service role)
   - File size limit: según necesidad (p. ej. 10 MB)
   - Allowed MIME types (opcional): `application/pdf`, `image/*`, `application/msword`, etc.

## Políticas de Storage (RLS)

En **Storage** → `ingredient-documents` → **Policies**, añade:

### Lectura (usuarios autenticados)

```sql
CREATE POLICY "Authenticated read ingredient docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ingredient-documents');
```

### Subida (usuarios autenticados)

```sql
CREATE POLICY "Authenticated upload ingredient docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ingredient-documents');
```

### Borrado (usuarios autenticados)

```sql
CREATE POLICY "Authenticated delete ingredient docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ingredient-documents');
```

## Convención de rutas

Los archivos se guardan como:

```
{ingredientId}/{timestamp}-{fileName}
```

Ejemplo: `a1b2c3d4-.../1718123456789-ficha-tecnica.pdf`

La app registra `storagePath` en la tabla `ingredient_documents` tras un upload exitoso.

## Variables de entorno

| Variable                        | Uso                                    |
| ------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Cliente Storage                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Upload desde API con sesión de usuario |

Sin bucket configurado, en **modo demo** (`!DATABASE_URL`) la API puede guardar referencias `local://...` en memoria. En **producción** con `DATABASE_URL`, el upload debe completarse en Storage o la API devolverá error.

## Verificación

1. Inicia sesión en la app.
2. Ve a un ingrediente → **Documentos** → sube un PDF.
3. En Storage, confirma que aparece el objeto bajo `{ingredientId}/`.
