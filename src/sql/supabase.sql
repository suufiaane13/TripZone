-- SQL Setup for TripZone 🚌 (Updated with smart triggers)

-- 1. Table: trips
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    date DATE NOT NULL,
    departure_time TIME NOT NULL,
    places_total INTEGER NOT NULL DEFAULT 20,
    places_reserved INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: destinations
CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: reservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    persons INTEGER NOT NULL CHECK (persons > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Allow public read trips" ON trips;
CREATE POLICY "Allow public read trips" ON trips FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Allow public read destinations" ON destinations;
CREATE POLICY "Allow public read destinations" ON destinations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage trips" ON trips;
CREATE POLICY "Allow admin manage trips" ON trips FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin manage destinations" ON destinations;
CREATE POLICY "Allow admin manage destinations" ON destinations FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public insert reservations" ON reservations;
CREATE POLICY "Allow public insert reservations" ON reservations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin read reservations" ON reservations;
CREATE POLICY "Allow admin read reservations" ON reservations FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin update reservations" ON reservations;
CREATE POLICY "Allow admin update reservations" ON reservations FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Trigger pour mettre à jour les places intelligemment
CREATE OR REPLACE FUNCTION update_trip_places_smart()
RETURNS TRIGGER AS $$
BEGIN
    -- Cas 1: Nouvelle réservation
    IF (TG_OP = 'INSERT') THEN
        UPDATE trips
        SET places_reserved = places_reserved + NEW.persons
        WHERE id = NEW.trip_id;
    
    -- Cas 2: Mise à jour du statut (Annulation ou confirmation)
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Si on passe de (pending/confirmed) à 'cancelled' -> on libère les places
        IF (NEW.status = 'cancelled' AND OLD.status != 'cancelled') THEN
            UPDATE trips
            SET places_reserved = places_reserved - OLD.persons
            WHERE id = OLD.trip_id;
        -- Si on réactive une réservation annulée -> on reprend les places
        ELSIF (OLD.status = 'cancelled' AND NEW.status != 'cancelled') THEN
            UPDATE trips
            SET places_reserved = places_reserved + NEW.persons
            WHERE id = NEW.trip_id;
        END IF;

    -- Cas 3: Suppression de réservation
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.status != 'cancelled') THEN
            UPDATE trips
            SET places_reserved = places_reserved - OLD.persons
            WHERE id = OLD.trip_id;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_reservation_change ON reservations;
CREATE TRIGGER on_reservation_change
AFTER INSERT OR UPDATE OR DELETE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_trip_places_smart();
