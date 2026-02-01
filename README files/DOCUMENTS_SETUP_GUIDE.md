# 📄 Documents Feature - Complete Setup Guide

## ❌ Current Issue
**Documents upload is not working because the Supabase Storage bucket hasn't been created yet.**

---

## ✅ **Quick Fix - 5 Minutes Setup**

### **Step 1: Create Storage Bucket in Supabase**

1. **Open your Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `elelltltkpmprdlqwwfx`

2. **Navigate to Storage**
   - Click on **"Storage"** in the left sidebar
   - You'll see the Storage management page

3. **Create New Bucket**
   - Click **"New Bucket"** button
   - Fill in the details:
     ```
     Bucket Name: documents
     Public Bucket: ✓ Yes (recommended for easy file access)
     File Size Limit: 52428800 (50 MB)
     Allowed MIME Types: See list below
     ```

4. **Allowed MIME Types** (Copy-paste this list):
   ```
   application/pdf
   image/*
   application/msword
   application/vnd.openxmlformats-officedocument.wordprocessingml.document
   application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   application/vnd.openxmlformats-officedocument.presentationml.presentation
   application/vnd.ms-excel
   application/vnd.ms-powerpoint
   text/plain
   application/zip
   application/x-rar-compressed
   application/x-zip-compressed
   ```

5. **Click "Create Bucket"**

---

### **Step 2: Apply RLS (Row Level Security) Policies**

After creating the bucket, you need to set up security policies:

1. **In Supabase Dashboard**, go to **SQL Editor**
2. **Copy and paste** the following SQL:

```sql
-- Policy: Users can upload their own files
CREATE POLICY "Users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own files  
CREATE POLICY "Users can view their documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

3. **Click "Run"** to execute the SQL

---

### **Step 3: Test Upload**

1. **Restart your dev server** (if it's running)
   ```powershell
   # Press Ctrl+C to stop
   npm run dev
   ```

2. **Navigate to Documents**
   - Go to: http://localhost:3000/documents
   - Click "Upload Document" button

3. **Try uploading a file**
   - Select any PDF, image, or document
   - Add a name and optional tags
   - Click "Upload"

---

## 🎯 **What This Does**

### **Supabase Storage Structure**
```
Storage Bucket: documents/
  └── {user-id}/
      ├── 1706745600000_report.pdf
      ├── 1706745700000_image.jpg
      └── 1706745800000_spreadsheet.xlsx
```

- Each user's files are stored in their own folder (by user ID)
- Files are named with timestamp + original name
- RLS policies ensure users can only access their own files

---

## 🔍 **Troubleshooting**

### **Issue: "Bucket not found" error**
**Solution:** Make sure the bucket name is exactly `documents` (lowercase, no spaces)

### **Issue: "Policy violation" error**
**Solution:** Run the RLS policies SQL again (Step 2)

### **Issue: "File too large" error**
**Solution:** Increase the file size limit in bucket settings

### **Issue: "MIME type not allowed" error**
**Solution:** Add the file type to allowed MIME types in bucket settings

---

## ✅ **Verification Checklist**

- [ ] Bucket named `documents` exists in Supabase Storage
- [ ] Bucket is set to Public
- [ ] File size limit is set (50 MB recommended)
- [ ] Allowed MIME types are configured
- [ ] RLS policies are applied (4 policies total)
- [ ] Dev server is restarted
- [ ] You can see the upload button on /documents page

---

## 📝 **Quick Setup Commands**

If you prefer CLI (advanced):

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref elelltltkpmprdlqwwfx

# Apply storage policies
supabase db push
```

---

## 🎉 **After Setup**

Once complete, you'll be able to:
- ✅ Upload files (PDFs, images, documents)
- ✅ View uploaded documents
- ✅ Download files
- ✅ Delete documents
- ✅ Search and filter by tags/categories
- ✅ See file metadata (size, type, upload date)

---

## 📊 **Storage Features**

The Documents feature supports:
- **File Types**: PDF, Images (JPG, PNG, GIF), Word, Excel, PowerPoint, ZIP
- **Max Size**: 50 MB per file
- **Organization**: Categories and tags
- **Security**: Files are private, accessible only by owner
- **Search**: Find documents by name or tags

---

## 🔒 **Security Notes**

- Files are stored securely in Supabase Storage
- Each user can only access their own files (RLS enforced)
- Files are encrypted in transit (HTTPS)
- Authentication required for all operations

---

**Need help?** Let me know if you encounter any errors during setup!
