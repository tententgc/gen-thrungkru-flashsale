-- Radius search function used by /api/notify/flash-sale.
-- Returns users opted-in for notifications within `radius_m` of (lng, lat),
-- excluding anyone already notified for this sale.

CREATE OR REPLACE FUNCTION public.users_within_radius(
  center_lng double precision,
  center_lat double precision,
  radius_m   double precision,
  exclude_ids text[]
) RETURNS TABLE (user_id uuid) AS $$
  SELECT ul."userId" AS user_id
  FROM public.user_locations ul
  WHERE ul."isOptedIn" = true
    AND (exclude_ids IS NULL OR NOT (ul."userId"::text = ANY(exclude_ids)))
    AND ST_DWithin(
      ul.geom,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
      radius_m
    )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.users_within_radius(double precision, double precision, double precision, text[]) TO service_role;
