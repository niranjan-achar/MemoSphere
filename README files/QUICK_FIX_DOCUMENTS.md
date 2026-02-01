# 🚀 QUICK START: Fix Documents Upload

## ✅ BUILD ERROR - FIXED!
Your application is now running successfully on **http://localhost:3000**

---

## 📄 DOCUMENTS FEATURE - Setup Required

### **Current Status:**
❌ Documents upload button exists but doesn't work  
❌ Supabase Storage bucket not created yet  
❌ No storage policies configured

### **Time to Fix:** 5 minutes

---

## 🎯 **STEP-BY-STEP VISUAL GUIDE**

### **STEP 1: Open Supabase Dashboard**

1. Go to: **https://supabase.com/dashboard**
2. Login if needed
3. Select your project (the one with URL: `elelltltkpmprdlqwwfx.supabase.co`)

---

### **STEP 2: Create Storage Bucket**

1. **Click "Storage"** in the left sidebar (icon looks like a folder)

2. **Click "New Bucket"** button (green button, top right)

3. **Fill in the form:**
   ```
   Name: documents
   ```
   ⚠️ **IMPORTANT**: Must be exactly `documents` (lowercase, no spaces)

4. **Public Bucket:** ✅ Check this box
   - This allows files to have public URLs
   - Files are still protected by RLS (only owners can access)

5. **Click "Create Bucket"**

---

### **STEP 3: Configure Bucket Settings**

1. **Click on the "documents" bucket** you just created

2. **Click "Settings" tab** (or gear icon)

3. **Set File Size Limit:**
   - Change to: `52428800` (50 MB)
   - Or use the UI to select "50 MB"

4. **Set Allowed MIME types:**
   - Click "Edit" or "Add MIME type"
   - Add these types (one per line):
     ```
     application/pdf
     image/*
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.ms-excel
     application/vnd.ms-powerpoint
     text/plain
     application/zip
     ```

5. **Click "Save"**

---

### **STEP 4: Apply Security Policies**

1. **Click "SQL Editor"** in the left sidebar

2. **Click "New Query"** button

3. **Copy and paste this entire SQL code:**

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

4. **Click "Run"** button (or press Ctrl+Enter)

5. **Verify:** You should see "Success. 4 rows affected" or similar

---

### **STEP 5: Test Upload**

1. **Open your app:** http://localhost:3001/documents

2. **Click "📤 Upload Document"** button

3. **Select a file** (PDF, image, or document)

4. **Fill in:**
   - Name: (any name)
   - Category: (optional)
   - Tags: (optional, comma-separated)

5. **Click "Upload"**

6. **Success!** You should see your document in the list

---

## ✅ **Verification Checklist**

Check these off as you complete each step:

- [ ] Opened Supabase Dashboard
- [ ] Created bucket named `documents`
- [ ] Set bucket to Public
- [ ] Configured file size limit (50 MB)
- [ ] Added allowed MIME types
- [ ] Ran SQL policies (all 4)
- [ ] Saw "Success" message in SQL Editor
- [ ] Tested upload on /documents page
- [ ] File appeared in documents list

---

## 🔍 **Verify Policies Were Created**

To confirm policies are active:

1. In Supabase Dashboard, go to **Storage** → **documents** bucket
2. Click **"Policies"** tab
3. You should see 4 policies:
   - ✅ Users can upload documents (INSERT)
   - ✅ Users can view their documents (SELECT)
   - ✅ Users can update their documents (UPDATE)
   - ✅ Users can delete their documents (DELETE)

---

## ❓ **Common Errors & Solutions**

### **Error: "Bucket not found"**
**Solution:** 
- Bucket name must be exactly `documents` (lowercase)
- No typos, no spaces, no capital letters

### **Error: "New row violates row-level security"**
**Solution:**
- Run the SQL policies again (Step 4)
- Make sure all 4 policies show "Success"

### **Error: "File too large"**
**Solution:**
- Check file size limit in bucket settings
- Increase to 50 MB or higher

### **Error: "Invalid MIME type"**
**Solution:**
- Add the file type to allowed MIME types
- For example, add `image/*` for all images

### **Upload button does nothing**
**Solution:**
- Check browser console for errors (F12)
- Make sure you're logged in
- Verify the bucket was created

---

## 🎉 **What You'll Have After Setup**

Once completed, the Documents feature will:

✅ **Upload Files**
- Drag & drop or browse to select files
- Support for PDFs, images, Word, Excel, PowerPoint, ZIP
- Up to 50 MB per file

✅ **Organize**
- Add custom names
- Categorize documents
- Tag for easy searching

✅ **Manage**
- View all your documents in a grid
- Search by name or tags
- Filter by category
- Download files
- Delete unwanted documents

✅ **Security**
- Files are private (only you can access them)
- Encrypted in transit
- Row Level Security enforced
- Each user has their own folder

---

## 📊 **Storage Structure**

After upload, your files will be organized like this:

```
Supabase Storage
└── documents/
    └── {your-user-id}/
        ├── 1706745123456_report.pdf
        ├── 1706745234567_presentation.pptx
        └── 1706745345678_image.jpg
```

Each file is prefixed with a timestamp to ensure uniqueness.

---

## 💡 **Pro Tips**

1. **Organize with Tags:** Use tags like "work", "personal", "important" for easy filtering
2. **Use Categories:** Create categories like "Reports", "Presentations", "Images"
3. **Descriptive Names:** Give files meaningful names for easier searching
4. **Regular Cleanup:** Delete files you no longer need to save storage space

---

## 📞 **Need Help?**

If you get stuck:
1. Check the error message in browser console (F12)
2. Verify each step was completed correctly
3. Try creating the bucket again with exact settings
4. Make sure you're logged in to the app

---

**Ready?** Follow the steps above and your Documents feature will be fully functional! 🚀
