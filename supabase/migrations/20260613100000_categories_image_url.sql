-- Add image_url to categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for category images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read policy (anyone can view category images)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'category-images public read'
  ) THEN
    CREATE POLICY "category-images public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'category-images');
  END IF;
END $$;

-- Authenticated upload policy (admins can upload)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'category-images auth upload'
  ) THEN
    CREATE POLICY "category-images auth upload"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'category-images');
  END IF;
END $$;

-- Authenticated update/delete policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'category-images auth modify'
  ) THEN
    CREATE POLICY "category-images auth modify"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'category-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'category-images auth delete'
  ) THEN
    CREATE POLICY "category-images auth delete"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'category-images');
  END IF;
END $$;
