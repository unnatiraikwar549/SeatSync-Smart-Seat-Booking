-- ==============================================================================
-- SeatSync — Smart Library Seat Finder
-- Supabase PostgreSQL Schema & Real-time Configuration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FLOORS TABLE
CREATE TABLE IF NOT EXISTS public.floors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    level INTEGER NOT NULL UNIQUE,
    total_seats INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. SEATS TABLE
CREATE TYPE seat_status AS ENUM ('available', 'occupied', 'reserved', 'away');

CREATE TABLE IF NOT EXISTS public.seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seat_number TEXT NOT NULL,
    floor_id TEXT NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
    zone TEXT NOT NULL,
    x_coord FLOAT NOT NULL DEFAULT 0,
    y_coord FLOAT NOT NULL DEFAULT 0,
    has_power BOOLEAN DEFAULT true,
    is_window BOOLEAN DEFAULT false,
    is_quiet BOOLEAN DEFAULT true,
    has_monitor BOOLEAN DEFAULT false,
    is_ergonomic BOOLEAN DEFAULT true,
    status seat_status DEFAULT 'available',
    current_student_id TEXT,
    current_student_name TEXT,
    current_booking_id UUID,
    away_start_time TIMESTAMP WITH TIME ZONE,
    away_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_seat_per_floor UNIQUE (floor_id, seat_number)
);

-- 3. BOOKINGS TABLE
CREATE TYPE booking_status AS ENUM ('reserved', 'checked_in', 'away', 'completed', 'canceled', 'auto_released');

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seat_id UUID NOT NULL REFERENCES public.seats(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    floor_id TEXT NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status booking_status DEFAULT 'reserved' NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    away_started_at TIMESTAMP WITH TIME ZONE,
    qr_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Unique index to prevent double bookings on active states (reserved, checked_in, away)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_seat_booking 
ON public.bookings (seat_id) 
WHERE status IN ('reserved', 'checked_in', 'away');

-- 4. CHECK-INS TABLE
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES public.seats(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    device_info TEXT,
    verified BOOLEAN DEFAULT true
);

-- 5. AWAY TIMERS TABLE
CREATE TABLE IF NOT EXISTS public.away_timers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES public.seats(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    auto_released BOOLEAN DEFAULT false,
    duration_minutes INTEGER DEFAULT 20
);

-- 6. AUTOMATIC TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seats_modtime
    BEFORE UPDATE ON public.seats
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_bookings_modtime
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 7. FUNCTION TO AUTO-RELEASE EXPIRED AWAY TIMERS
CREATE OR REPLACE FUNCTION release_expired_away_seats()
RETURNS INTEGER AS $$
DECLARE
    released_count INTEGER := 0;
    expired_record RECORD;
BEGIN
    FOR expired_record IN 
        SELECT id, seat_id, student_id 
        FROM public.bookings 
        WHERE status = 'away' 
          AND id IN (SELECT current_booking_id FROM public.seats WHERE away_expires_at <= NOW())
    LOOP
        -- Update booking status
        UPDATE public.bookings 
        SET status = 'auto_released', updated_at = NOW() 
        WHERE id = expired_record.id;

        -- Update seat to available
        UPDATE public.seats 
        SET status = 'available', 
            current_student_id = NULL, 
            current_student_name = NULL, 
            current_booking_id = NULL,
            away_start_time = NULL,
            away_expires_at = NULL,
            updated_at = NOW() 
        WHERE id = expired_record.seat_id;

        -- Mark away timer record
        UPDATE public.away_timers 
        SET auto_released = true 
        WHERE booking_id = expired_record.id AND returned_at IS NULL;

        released_count := released_count + 1;
    END LOOP;

    RETURN released_count;
END;
$$ LANGUAGE plpgsql;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.away_timers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to floors and seats for real-time map viewing
CREATE POLICY "Public read floors" ON public.floors FOR SELECT USING (true);
CREATE POLICY "Public read seats" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Public read bookings" ON public.bookings FOR SELECT USING (true);

-- Allow authenticated or demo users to insert/update bookings
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (true);

-- Allow seat status update upon booking or release
CREATE POLICY "Allow seat status update" ON public.seats FOR UPDATE USING (true);
CREATE POLICY "Allow check_ins insert" ON public.check_ins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow away_timers insert/update" ON public.away_timers FOR ALL USING (true);

-- 9. REAL-TIME REPLICATION
-- Enable real-time for seats and bookings tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.away_timers;

-- 10. INITIAL SEED DATA
INSERT INTO public.floors (id, name, description, level, total_seats) VALUES
('ground', 'Ground Floor', 'Collaborative Study Hub, Cafe & Multimedia Zone', 0, 20),
('first', 'First Floor', 'Silent Individual Desks & Window Vista Area', 1, 20),
('second', 'Second Floor', 'Deep Focus Research Pods & Postgraduate Study', 2, 20)
ON CONFLICT (id) DO NOTHING;
