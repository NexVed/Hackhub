-- Migration: Add sample hackathons from multiple platforms
-- Description: Populates scraped_hackathons table with demo data from various platforms

-- Insert sample hackathons from different platforms
INSERT INTO scraped_hackathons (
    provider_platform_name,
    hackathon_name,
    start_date,
    end_date,
    status,
    place_region,
    location,
    description,
    direct_link
) VALUES
-- Devfolio Hackathons
('Devfolio', 'ETHIndia 2026', '2026-02-15', '2026-02-17', 'upcoming', 'india', 'Bangalore', 'Asia''s largest Ethereum hackathon bringing together developers, designers, and entrepreneurs to build the future of Web3.', 'https://devfolio.co/ethindia2026'),
('Devfolio', 'HackFS 2026', '2026-03-01', '2026-03-15', 'upcoming', 'online', 'Virtual', 'Build the foundation for a better internet with decentralized storage and compute. Sponsored by Protocol Labs.', 'https://devfolio.co/hackfs2026'),
('Devfolio', 'BUIDLit 2026', '2026-02-20', '2026-02-22', 'upcoming', 'india', 'Delhi', 'India''s premier Web3 hackathon focused on building real-world applications using blockchain technology.', 'https://devfolio.co/buidlit2026'),
('Devfolio', 'Solana Hyperdrive', '2026-01-25', '2026-02-28', 'live', 'global', 'Virtual', 'Build groundbreaking applications on Solana. Over $500K in prizes!', 'https://devfolio.co/solanahyperdrive'),

-- HackerEarth Hackathons  
('HackerEarth', 'Code4Climate', '2026-02-10', '2026-02-25', 'upcoming', 'global', 'Virtual', 'Build innovative solutions to combat climate change and promote sustainability.', 'https://hackerearth.com/code4climate2026'),
('HackerEarth', 'FinTech Innovation Challenge', '2026-03-05', '2026-03-20', 'upcoming', 'india', 'Mumbai', 'Create next-gen fintech solutions for India''s digital economy.', 'https://hackerearth.com/fintech-challenge-2026'),
('HackerEarth', 'AI for Good', '2026-01-28', '2026-02-15', 'live', 'global', 'Virtual', 'Leverage artificial intelligence to solve pressing global challenges.', 'https://hackerearth.com/ai-for-good-2026'),
('HackerEarth', 'Healthcare Innovation Sprint', '2026-02-28', '2026-03-10', 'upcoming', 'india', 'Hyderabad', 'Transform healthcare delivery with technology-driven solutions.', 'https://hackerearth.com/health-sprint-2026'),

-- MLH (Major League Hacking) Hackathons
('MLH', 'HackMIT 2026', '2026-02-22', '2026-02-23', 'upcoming', 'global', 'Boston, USA', 'One of the largest hackathons in the world, hosted at MIT.', 'https://mlh.io/hackmit-2026'),
('MLH', 'TreeHacks 2026', '2026-02-14', '2026-02-16', 'upcoming', 'global', 'Stanford, USA', 'Stanford''s flagship hackathon bringing together innovators from around the world.', 'https://mlh.io/treehacks-2026'),
('MLH', 'PennApps 2026', '2026-03-08', '2026-03-10', 'upcoming', 'global', 'Philadelphia, USA', 'The original college hackathon at University of Pennsylvania.', 'https://mlh.io/pennapps-2026'),
('MLH', 'Local Hack Day: Build', '2026-02-01', '2026-02-01', 'upcoming', 'global', 'Virtual', 'A global 12-hour hackathon celebrating building and learning together.', 'https://mlh.io/lhd-build-2026'),

-- Devpost Hackathons
('Devpost', 'Microsoft Imagine Cup 2026', '2026-02-01', '2026-04-30', 'live', 'global', 'Virtual', 'Empower every student on the planet to achieve more. $100K grand prize!', 'https://devpost.com/imagine-cup-2026'),
('Devpost', 'AWS GameDay Challenge', '2026-03-01', '2026-03-31', 'upcoming', 'global', 'Virtual', 'Build the next hit game using AWS cloud gaming services.', 'https://devpost.com/aws-gameday-2026'),
('Devpost', 'Google Cloud Hackathon', '2026-02-15', '2026-03-15', 'upcoming', 'global', 'Virtual', 'Create innovative solutions using Google Cloud Platform and AI tools.', 'https://devpost.com/google-cloud-hack-2026'),
('Devpost', 'Meta AR/VR Hackathon', '2026-04-01', '2026-04-30', 'upcoming', 'global', 'Virtual', 'Build the metaverse with Meta''s AR/VR technologies.', 'https://devpost.com/meta-arvr-2026'),

-- Hack2Skill Hackathons
('Hack2Skill', 'Smart India Hackathon 2026', '2026-03-01', '2026-03-03', 'upcoming', 'india', 'Multiple Cities', 'India''s largest open innovation platform, supported by AICTE.', 'https://hack2skill.com/sih-2026'),
('Hack2Skill', 'DeepTech Challenge', '2026-02-20', '2026-03-05', 'upcoming', 'india', 'Virtual', 'Solve India''s toughest problems using AI, ML, and IoT.', 'https://hack2skill.com/deeptech-2026'),
('Hack2Skill', 'GovTech Innovation', '2026-04-10', '2026-04-25', 'upcoming', 'india', 'Delhi', 'Build solutions for digital governance and public services.', 'https://hack2skill.com/govtech-2026'),

-- Devnovate Hackathons
('Devnovate', 'InnovateTech 2026', '2026-02-25', '2026-02-27', 'upcoming', 'india', 'Pune', 'Flagship hackathon focused on emerging technologies and startup innovation.', 'https://devnovate.com/innovatetech-2026'),
('Devnovate', 'EdTech Revolution', '2026-03-15', '2026-03-17', 'upcoming', 'india', 'Bangalore', 'Transform education through technology and innovation.', 'https://devnovate.com/edtech-2026')

ON CONFLICT (direct_link) DO UPDATE SET
    hackathon_name = EXCLUDED.hackathon_name,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status,
    place_region = EXCLUDED.place_region,
    location = EXCLUDED.location,
    description = EXCLUDED.description,
    source_scraped_at = NOW();

-- Add comment
COMMENT ON TABLE scraped_hackathons IS 'Now contains sample hackathons from Unstop, Devfolio, HackerEarth, MLH, Devpost, Hack2Skill, and Devnovate platforms';
