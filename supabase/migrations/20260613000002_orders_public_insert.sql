-- Allow anonymous customers to insert orders (no auth required for checkout)
CREATE POLICY "Public can insert orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
