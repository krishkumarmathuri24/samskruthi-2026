-- ============================================================
-- Samskruthi 2026 — Replace All Events
-- Run this in Supabase > SQL Editor > New Query
-- ============================================================

-- Step 1: Delete all tickets (foreign key dependency)
DELETE FROM tickets;

-- Step 2: Delete all old events
DELETE FROM events;

-- Step 3: Insert all 28 new events
INSERT INTO events (title, category, description, event_date, venue, capacity, tickets_booked, duration, emoji) VALUES

-- ────────────── ON STAGE EVENTS ──────────────
('Classical Dance', 'Dance',
 'Showcase the grace and tradition of classical Indian dance forms like Bharatanatyam, Kuchipudi, and Odissi. Performers will be judged on technique, expression, and costume.',
 '2026-08-15 09:00:00', 'On Stage', 500, 0, '2 hours', '💃'),

('Classical Singing', 'Music',
 'A melodious competition celebrating the classical ragas and talas of Indian music. Participants may perform Carnatic or Hindustani classical singing.',
 '2026-08-15 09:00:00', 'On Stage', 500, 0, '2 hours', '🎶'),

('Duet Singing', 'Music',
 'Two voices, one harmony. Pairs will showcase their vocal chemistry and coordination across any genre — from Bollywood to folk to devotional.',
 '2026-08-15 11:00:00', 'On Stage', 500, 0, '2 hours', '🎤'),

('Solo Singing', 'Music',
 'Step into the spotlight and let your voice shine! Solo singers from any genre are welcome. Be judged on sur, taal, and stage presence.',
 '2026-08-15 11:00:00', 'On Stage', 500, 0, '2 hours', '🎙️'),

('Duet Dance', 'Dance',
 'Two dancers, one unforgettable performance. Pairs can perform any dance style — classical, fusion, contemporary, or Bollywood. Judged on sync and expression.',
 '2026-08-15 13:00:00', 'On Stage', 500, 0, '2 hours', '🕺'),

('Solo Dance', 'Dance',
 'Own the stage alone! Solo dancers can perform any style — from classical to freestyle. Express your passion through movement and be judged on technique and energy.',
 '2026-08-15 13:00:00', 'On Stage', 500, 0, '2 hours', '💫'),

('Group Dance', 'Dance',
 'Teams of 5 or more light up the stage in a high-energy group dance competition. Choreography, synchronization, and theme will be the key judging criteria.',
 '2026-08-15 15:00:00', 'On Stage', 500, 0, '2 hours', '🎭'),

('Fashion Show', 'Fashion',
 'Walk the ramp and turn heads! Participants showcase their style, theme-based outfits, and confidence. Judged on costume creativity, walk, and overall presentation.',
 '2026-08-15 15:00:00', 'On Stage', 500, 0, '2 hours', '👗'),

('Instrumental', 'Music',
 'Let your instrument do the talking! Solo or ensemble performances on any instrument are welcome — violin, flute, tabla, guitar, keyboard, and more.',
 '2026-08-16 09:00:00', 'On Stage', 500, 0, '2 hours', '🎸'),

('Battle of Bands', 'Music',
 'Rock the campus! Bands compete head-to-head in an electrifying live music battle. Any genre is welcome — rock, metal, fusion, or indie. May the best band win!',
 '2026-08-16 11:00:00', 'On Stage', 800, 0, '3 hours', '🎵'),

('Stand-Up Comedy', 'Comedy',
 'Make the crowd roar with laughter! Aspiring comedians take the mic for a set of original stand-up material. Judged on humor, timing, and crowd engagement.',
 '2026-08-16 13:00:00', 'On Stage', 500, 0, '2 hours', '😂'),

('Mime', 'Arts',
 'No words, just emotions. Mime artists convey powerful stories using only gestures and expressions. A deeply creative and thought-provoking event on the main stage.',
 '2026-08-16 13:00:00', 'On Stage', 500, 0, '1.5 hours', '🤫'),

('Drama', 'Arts',
 'Bring stories to life on stage! Teams perform original or adapted plays. Judged on script, acting, direction, costumes, and overall presentation.',
 '2026-08-16 15:00:00', 'On Stage', 500, 0, '3 hours', '🎬'),

('Beat Boxing', 'Music',
 'Control the beat with just your mouth! Beat boxers perform live vocal percussion — from classic hip-hop beats to experimental soundscapes. Show us what you have got!',
 '2026-08-16 16:00:00', 'On Stage', 500, 0, '1.5 hours', '🥁'),

-- ────────────── OFF STAGE EVENTS ──────────────
('Painting', 'Art',
 'Express yourself on canvas! Participants paint on a given theme using any medium — watercolour, acrylic, or oil. Judged on creativity, technique, and presentation.',
 '2026-08-15 10:00:00', 'Off Stage', 200, 0, '3 hours', '🎨'),

('Rangoli', 'Art',
 'Celebrate colours and tradition! Participants create intricate rangoli designs on the floor using powder, flowers, or both. A beautiful fusion of art and culture.',
 '2026-08-15 10:00:00', 'Off Stage', 150, 0, '2.5 hours', '🌸'),

('Short Film', 'Art',
 'Tell a story in minutes! Teams submit a short film (up to 10 minutes) on a given theme. Judged on screenplay, cinematography, editing, and direction.',
 '2026-08-15 11:00:00', 'Off Stage', 100, 0, '3 hours', '🎥'),

('Sketching', 'Art',
 'Put pencil to paper and create magic! Participants sketch on a live theme using pencil, charcoal, or ink. Judged on realism, creativity, and detailing.',
 '2026-08-15 10:00:00', 'Off Stage', 200, 0, '2 hours', '✏️'),

('Dance Battle', 'Dance',
 'Hit the floor and battle it out! 1v1 freestyle dance battles where dancers face off in front of the crowd. Any style — hip-hop, locking, popping, or breaking.',
 '2026-08-15 14:00:00', 'Off Stage', 300, 0, '3 hours', '🔥'),

('Photography', 'Art',
 'Capture the moment! Participants roam the campus and submit their best shots on a given theme. Judged on composition, lighting, creativity, and storytelling.',
 '2026-08-15 09:00:00', 'Off Stage', 100, 0, '4 hours', '📸'),

('Mehendi', 'Art',
 'A vibrant celebration of henna art! Participants design intricate mehendi patterns on a canvas provided. Judged on fineness, pattern density, and creativity.',
 '2026-08-15 10:00:00', 'Off Stage', 100, 0, '2 hours', '🌿'),

('Quiz', 'Literature',
 'Test your general knowledge and quick thinking! Teams of 2 compete across rounds covering science, history, pop culture, sports, and current affairs.',
 '2026-08-16 10:00:00', 'Off Stage', 200, 0, '2 hours', '🧠'),

('Spoken Poetry', 'Literature',
 'Your voice, your verses. Participants perform original or chosen poetry with emotion and rhythm. Judged on content, delivery, stage presence, and impact.',
 '2026-08-16 11:00:00', 'Off Stage', 200, 0, '2 hours', '📝'),

('Online Gaming [Free Fire]', 'Gaming',
 'Gear up and survive! Teams of 4 battle it out in a thrilling Free Fire tournament. The last squad standing takes the crown. Register your squad and enter the zone!',
 '2026-08-16 10:00:00', 'Off Stage', 200, 0, '4 hours', '🎮'),

('MadAds', 'Art',
 'Turn the absurd into advertising gold! Teams create and perform a hilarious advertisement for a ridiculous fictional product on the spot. Creativity and humor are key!',
 '2026-08-16 13:00:00', 'Off Stage', 200, 0, '2 hours', '📢'),

('Face Painting', 'Art',
 'Transform a face into a canvas! Artists have 45 minutes to paint a model''s face in any design or theme. Judged on creativity, technique, and the final result.',
 '2026-08-16 11:00:00', 'Off Stage', 100, 0, '2 hours', '🎭'),

('Parliament', 'Literature',
 'Debate, deliberate, and decide! A mock parliament where participants take on roles as MPs and debate a given bill or motion. Judged on argumentation, decorum, and eloquence.',
 '2026-08-16 14:00:00', 'Off Stage', 200, 0, '3 hours', '🏛️'),

('Graffiti Art', 'Art',
 'Paint the walls with your imagination! Participants create graffiti-style art on a designated canvas using spray cans and stencils. Judged on design, message, and technique.',
 '2026-08-15 09:00:00', 'Off Stage', 100, 0, '3 hours', '🖌️');
