-- Add vault_pin_hash column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS vault_pin_hash TEXT;

-- Add comment
COMMENT ON COLUMN public.users.vault_pin_hash IS 'SHA-256 hash of user vault PIN for secure access';
