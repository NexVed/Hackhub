-- Migration: Create MNC Hackathons table
-- Description: Stores top MNC hackathons for the calendar feature

-- Create the mnc_hackathons table
CREATE TABLE IF NOT EXISTS mnc_hackathons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    organizer TEXT NOT NULL,
    logo_url TEXT,
    timeline TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'live', 'ended')),
    url TEXT,
    description TEXT,
    eligibility TEXT,
    focus_areas TEXT[] DEFAULT '{}',
    perks TEXT,
    selection_process TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    registration_start DATE,
    registration_end DATE,
    is_flagship BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for faster queries by status and dates
CREATE INDEX IF NOT EXISTS idx_mnc_hackathons_status ON mnc_hackathons(status);
CREATE INDEX IF NOT EXISTS idx_mnc_hackathons_dates ON mnc_hackathons(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE mnc_hackathons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (hackathons are public info)
CREATE POLICY "Allow public read access to mnc_hackathons"
    ON mnc_hackathons
    FOR SELECT
    USING (true);

-- Create policy to allow authenticated users to insert (for admin purposes)
CREATE POLICY "Allow authenticated insert to mnc_hackathons"
    ON mnc_hackathons
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_mnc_hackathons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mnc_hackathons_timestamp
    BEFORE UPDATE ON mnc_hackathons
    FOR EACH ROW
    EXECUTE FUNCTION update_mnc_hackathons_updated_at();

-- Seed the 6 MNC Hackathons
INSERT INTO mnc_hackathons (name, organizer, logo_url, timeline, status, url, description, eligibility, focus_areas, perks, selection_process, tech_stack, start_date, end_date, registration_start, registration_end, is_flagship) VALUES
-- Amazon ML Summer School
(
    'Amazon ML Summer School',
    'Amazon',
    '/logos/amazon.svg',
    'Jul - Aug 2026',
    'upcoming',
    'https://www.amazon.science/academic-engagements/amazon-ml-summer-school',
    'Intensive training on Machine Learning (Supervised Learning, Deep Learning, NLP, etc.) taught by Amazon Scientists.',
    'B.Tech/M.Tech/PhD students graduating in 2026 or 2027',
    ARRAY['Machine Learning', 'Deep Learning', 'NLP', 'Supervised Learning'],
    'Platform to interact with scientists and potential internship/PPO opportunities with stipends up to ₹1.5 Lakh/month.',
    'Online assessment covering Linear Algebra, Probability, Statistics, and Python basics.',
    ARRAY['Python', 'TensorFlow', 'PyTorch'],
    '2026-08-01',
    '2026-08-31',
    '2026-07-01',
    '2026-07-20',
    true
),
-- Samsung Innovation Campus (SIC)
(
    'Samsung Innovation Campus (SIC)',
    'Samsung',
    '/logos/samsung.svg',
    'Jan - Mar 2026',
    'upcoming',
    'https://www.samsung.com/in/innovation-campus/',
    'AI, IoT, Big Data, and Coding training program for the Fourth Industrial Revolution.',
    'Students graduating between 2023–2027',
    ARRAY['AI', 'IoT', 'Big Data', 'Coding'],
    'Government-recognized certifications and hands-on training for the Fourth Industrial Revolution.',
    'Application form followed by technical assignments.',
    ARRAY['Python', 'IoT Platforms', 'Cloud'],
    '2026-01-15',
    '2026-03-31',
    '2026-01-01',
    '2026-01-31',
    true
),
-- American Express CodeStreet / Makeathon
(
    'American Express CodeStreet / Makeathon',
    'American Express',
    '/logos/amex.svg',
    'Apr - Jun 2026',
    'upcoming',
    'https://campus.americanexpress.com/',
    'Full-stack development, AI/ML, and FinTech innovation hackathon.',
    'Often targeted at women students in technical degrees graduating in 2026/2027',
    ARRAY['Full-Stack Development', 'AI/ML', 'FinTech'],
    'Prizes up to ₹1.5 Lakhs and direct interview opportunities for internships or full-time roles.',
    'Idea Submission followed by Prototype Phase.',
    ARRAY['React', 'Python', 'TensorFlow', 'AWS', 'Azure'],
    '2026-04-01',
    '2026-06-30',
    '2026-04-01',
    '2026-05-15',
    true
),
-- Google Summer of Code (GSoC)
(
    'Google Summer of Code (GSoC)',
    'Google',
    '/logos/google.svg',
    'Jan - Aug 2026',
    'open',
    'https://summerofcode.withgoogle.com',
    'Global program offering stipends to contributors working with open-source organizations. Focus on GCP and GenAI tools.',
    'Students and open-source beginners',
    ARRAY['Open Source', 'Cloud', 'GenAI', 'GCP'],
    'Significant stipends, global mentorship, and a massive boost to your GitHub profile.',
    'Organization applications in Jan/Feb; Contributor applications in March–April; Coding from June–August.',
    ARRAY['Various open-source technologies', 'GCP', 'Python', 'JavaScript'],
    '2026-06-01',
    '2026-08-31',
    '2026-01-15',
    '2026-04-15',
    true
),
-- Adobe India Hackathon (GenSolve)
(
    'Adobe GenSolve',
    'Adobe',
    '/logos/adobe.svg',
    'Jul - Sep 2026',
    'upcoming',
    'https://www.adobegensolve.com/',
    'Building intelligent document understanding systems and creative tech solutions.',
    'All engineering years (2026–2029 batches)',
    ARRAY['Document Intelligence', 'Creative Tech', 'AI'],
    'MacBook Air for winners, iPad Air for runners-up, and internship PPOs with ₹1 Lakh/month stipends.',
    'MCQ + Coding round followed by building a functional prototype.',
    ARRAY['Python', 'Machine Learning', 'Document Processing'],
    '2026-07-15',
    '2026-09-30',
    '2026-06-01',
    '2026-07-10',
    true
),
-- Walmart Sparkathon
(
    'Walmart Sparkathon',
    'Walmart',
    '/logos/walmart.svg',
    'Jun - Aug 2026',
    'upcoming',
    'https://careers.walmart.com/technology',
    'Reimagining retail: Customer experience, Supply chain, Sustainability, Cybersecurity.',
    'B.E./B.Tech/M.Tech students graduating in 2026 or 2027',
    ARRAY['Retail Tech', 'Customer Experience', 'Supply Chain', 'Sustainability', 'Cybersecurity'],
    'Cash prizes up to ₹2.9 Lakhs and interview opportunities for Software Developer roles at Walmart Global Tech.',
    'Applications open in June; Finalists announced in July; Winners in August.',
    ARRAY['Full-Stack', 'Cloud', 'Data Analytics'],
    '2026-06-01',
    '2026-08-31',
    '2026-06-01',
    '2026-06-30',
    true
);

-- Insert additional hackathons: GLOBAL TECH GIANTS
INSERT INTO mnc_hackathons (name, organizer, logo_url, timeline, status, url, description, eligibility, focus_areas, perks, selection_process, tech_stack, start_date, end_date, registration_start, registration_end, is_flagship) VALUES
-- Google Solution Challenge 2026
(
    'Google Solution Challenge 2026',
    'Google Developers + DSC Clubs',
    '/logos/google.svg',
    'Feb - May 2026',
    'upcoming',
    'https://developers.google.com/community/gdsc-solution-challenge',
    'Build solutions for the UN Sustainable Development Goals using Google technologies.',
    'University students worldwide',
    ARRAY['SDG', 'AI', 'Web', 'Android'],
    '$25K + mentorship from Google engineers',
    'Team registration, prototype submission, and demo day.',
    ARRAY['Flutter', 'Firebase', 'TensorFlow', 'Google Cloud'],
    '2026-02-01',
    '2026-05-31',
    '2026-02-01',
    '2026-03-15',
    true
),
-- Amazon AWS AI/ML Hackathon 2026
(
    'Amazon AWS AI/ML Hackathon 2026',
    'Amazon Web Services',
    '/logos/aws.svg',
    'Apr - Jun 2026',
    'upcoming',
    'https://aws.amazon.com/hackathons',
    'Build innovative AI/ML solutions using AWS services and infrastructure.',
    'Developers and students globally',
    ARRAY['AI', 'Machine Learning', 'Cloud Infrastructure'],
    '$50K + AWS credits + job referrals',
    'Project submission, technical evaluation, demo presentation.',
    ARRAY['AWS SageMaker', 'Lambda', 'S3', 'Bedrock'],
    '2026-04-01',
    '2026-06-30',
    '2026-04-01',
    '2026-04-30',
    true
),
-- Meta Build for the Future Hackathon
(
    'Meta Build for the Future Hackathon',
    'Meta (Facebook)',
    '/logos/meta.svg',
    'Mar - May 2026',
    'upcoming',
    'https://developers.facebook.com/hackathons',
    'Create innovative solutions using AR/VR and AI for community impact.',
    'Developers and students globally',
    ARRAY['AR', 'VR', 'AI', 'Community Impact'],
    '$40K + Meta Reality Labs mentorship',
    'Idea submission, prototype demo, final presentation.',
    ARRAY['Meta Quest', 'Spark AR', 'PyTorch', 'React'],
    '2026-03-01',
    '2026-05-31',
    '2026-03-01',
    '2026-03-31',
    true
);

-- Insert additional hackathons: AI / MACHINE LEARNING
INSERT INTO mnc_hackathons (name, organizer, logo_url, timeline, status, url, description, eligibility, focus_areas, perks, selection_process, tech_stack, start_date, end_date, registration_start, registration_end, is_flagship) VALUES
-- NeurIPS AI Hackathon 2026
(
    'NeurIPS AI Hackathon 2026',
    'NeurIPS Conference + Meta AI',
    '/logos/neurips.svg',
    'Dec 2026',
    'upcoming',
    'https://neurips.cc/hackathon',
    'Cutting-edge Deep Learning, LLMs, and Generative AI hackathon at NeurIPS conference.',
    'AI researchers, students, and practitioners',
    ARRAY['Deep Learning', 'LLMs', 'Generative AI'],
    '$50K + research collaboration opportunities',
    'Application review, team formation, 48-hour hackathon.',
    ARRAY['PyTorch', 'JAX', 'Hugging Face', 'LangChain'],
    '2026-12-01',
    '2026-12-15',
    '2026-10-01',
    '2026-11-15',
    true
),
-- NVIDIA AI Innovation Challenge
(
    'NVIDIA AI Innovation Challenge',
    'NVIDIA + AI Nation',
    '/logos/nvidia.svg',
    'Jun - Aug 2026',
    'upcoming',
    'https://developer.nvidia.com/hackathons',
    'Build innovative solutions in Generative AI, Computer Vision, and Robotics.',
    'Developers, researchers, and students',
    ARRAY['Generative AI', 'Computer Vision', 'Robotics'],
    '$100K + NVIDIA GPU grants',
    'Project proposal, development phase, final demo.',
    ARRAY['CUDA', 'TensorRT', 'Omniverse', 'Isaac Sim'],
    '2026-06-01',
    '2026-08-31',
    '2026-05-01',
    '2026-06-15',
    true
),
-- Google Cloud Vertex AI Hackathon
(
    'Google Cloud Vertex AI Hackathon',
    'Google Cloud',
    '/logos/google.svg',
    'Apr 2026',
    'upcoming',
    'https://cloud.google.com/hackathons',
    'Build AI/ML solutions using Google Cloud Vertex AI and Cloud ML APIs.',
    'Developers and data scientists',
    ARRAY['AI', 'ML', 'Data Science', 'Cloud ML APIs'],
    '$30K + GCP credits',
    'Registration, project development, final submission.',
    ARRAY['Vertex AI', 'BigQuery ML', 'TensorFlow', 'AutoML'],
    '2026-04-01',
    '2026-04-30',
    '2026-03-01',
    '2026-03-31',
    true
),
-- AICTE National AI Hackathon (India)
(
    'AICTE National AI Hackathon',
    'AICTE + MeitY',
    '/logos/aicte.svg',
    'Feb - May 2026',
    'upcoming',
    'https://www.aicte-india.org/hackathons',
    'National-level AI hackathon focused on Education, Governance, and Sustainability.',
    'Indian engineering students',
    ARRAY['AI for Education', 'Governance', 'Sustainability'],
    '₹10 Lakhs + job offers from partner companies',
    'Online round, regional finals, national finals.',
    ARRAY['Python', 'TensorFlow', 'OpenCV', 'NLP tools'],
    '2026-02-01',
    '2026-05-31',
    '2026-01-15',
    '2026-02-15',
    true
);

-- Insert additional hackathons: UNITED STATES - Government & Federal
INSERT INTO mnc_hackathons (name, organizer, logo_url, timeline, status, url, description, eligibility, focus_areas, perks, selection_process, tech_stack, start_date, end_date, registration_start, registration_end, is_flagship) VALUES
-- NASA International Space Apps Challenge 2026
(
    'NASA Space Apps Challenge 2026',
    'NASA + ESA + JAXA',
    '/logos/nasa.svg',
    'Oct 2026',
    'upcoming',
    'https://www.spaceappschallenge.org',
    'Global hackathon addressing challenges using NASA''s open data for space and Earth science.',
    'Open to everyone globally',
    ARRAY['Space Tech', 'AI', 'Sustainability', 'Data Science'],
    'NASA internship opportunities + global recognition',
    '48-hour global hackathon with local and virtual events.',
    ARRAY['Python', 'JavaScript', 'NASA APIs', 'Data Visualization'],
    '2026-10-01',
    '2026-10-03',
    '2026-08-01',
    '2026-09-30',
    true
),
-- Federal AI Hackathon (GSA)
(
    'Federal AI Hackathon',
    'U.S. General Services Administration',
    '/logos/gsa.svg',
    'Apr 2026',
    'upcoming',
    'https://www.gsa.gov/technology/ai',
    'Develop AI solutions for government services and citizen experience.',
    'U.S. developers and civic technologists',
    ARRAY['AI in Government', 'Open Data', 'Citizen Services'],
    '$50K + pilot opportunity with U.S. government',
    'Application, development sprint, final presentation.',
    ARRAY['Python', 'APIs', 'Machine Learning', 'Cloud'],
    '2026-04-15',
    '2026-04-30',
    '2026-03-01',
    '2026-04-10',
    true
),
-- U.S. Treasury FinTech Innovation Hackathon
(
    'U.S. Treasury FinTech Hackathon',
    'U.S. Department of Treasury',
    '/logos/treasury.svg',
    'Jul 2026',
    'upcoming',
    'https://home.treasury.gov/fintech',
    'Innovate in digital payments, blockchain, and anti-fraud technologies.',
    'FinTech developers and researchers',
    ARRAY['Digital Payments', 'Blockchain', 'Anti-Fraud'],
    '$100K + collaboration opportunity with Treasury',
    'Proposal submission, development phase, demo day.',
    ARRAY['Blockchain', 'Python', 'APIs', 'Smart Contracts'],
    '2026-07-01',
    '2026-07-31',
    '2026-05-15',
    '2026-06-30',
    true
),
-- Department of Energy Climate Tech Hackathon
(
    'DOE Climate Tech Hackathon',
    'U.S. Department of Energy',
    '/logos/doe.svg',
    'May 2026',
    'upcoming',
    'https://www.energy.gov/hackathons',
    'Develop solutions for clean energy, carbon capture, and smart grids.',
    'Climate tech innovators and developers',
    ARRAY['Clean Energy', 'Carbon Capture', 'Smart Grids'],
    '$75K + DOE research access',
    'Application, prototype development, final pitch.',
    ARRAY['IoT', 'Data Analytics', 'Python', 'Simulation Tools'],
    '2026-05-01',
    '2026-05-31',
    '2026-03-15',
    '2026-04-30',
    true
);

-- Insert additional hackathons: INDIA - Government & National
INSERT INTO mnc_hackathons (name, organizer, logo_url, timeline, status, url, description, eligibility, focus_areas, perks, selection_process, tech_stack, start_date, end_date, registration_start, registration_end, is_flagship) VALUES
-- Smart India Hackathon (SIH 2026)
(
    'Smart India Hackathon 2026',
    'Ministry of Education + AICTE',
    '/logos/india.svg',
    'Aug - Dec 2026',
    'upcoming',
    'https://sih.gov.in',
    'India''s largest open innovation hackathon with problem statements from government ministries.',
    'Indian students from AICTE-approved institutions',
    ARRAY['AI', 'IoT', 'Healthcare', 'FinTech', 'Governance'],
    '₹1 Crore+ total prize pool',
    'Internal hackathon, nodal center selection, grand finale.',
    ARRAY['Full-Stack', 'AI/ML', 'IoT', 'Blockchain'],
    '2026-08-15',
    '2026-12-20',
    '2026-07-01',
    '2026-08-10',
    true
),
-- DRDO Dare2Dream Innovation Hackathon
(
    'DRDO Dare2Dream Hackathon',
    'DRDO (Defence R&D Organisation)',
    '/logos/drdo.svg',
    'May - Aug 2026',
    'upcoming',
    'https://www.drdo.gov.in/dare-dream',
    'Innovate in defence technology, robotics, AI, and aerospace.',
    'Indian students and startups',
    ARRAY['Defence Tech', 'Robotics', 'AI', 'Aerospace'],
    '₹10 Lakhs+ + potential DRDO collaboration',
    'Idea submission, prototype demo, final evaluation.',
    ARRAY['Embedded Systems', 'AI', 'Robotics', 'Drones'],
    '2026-05-01',
    '2026-08-31',
    '2026-04-01',
    '2026-05-15',
    true
),
-- ISRO Space Innovation Challenge
(
    'ISRO Space Innovation Challenge',
    'ISRO + IN-SPACE',
    '/logos/isro.svg',
    'Jun 2026',
    'upcoming',
    'https://www.isro.gov.in/spacetech-challenge',
    'Develop innovative solutions for space technology and satellite data analytics.',
    'Indian students and researchers',
    ARRAY['Space Tech', 'Data Analytics', 'AI for Space'],
    'Research grant + ISRO internship slots',
    'Proposal submission, technical review, prototype demo.',
    ARRAY['Python', 'Satellite Data', 'ML', 'GIS'],
    '2026-06-01',
    '2026-06-30',
    '2026-04-15',
    '2026-05-31',
    true
),
-- Atal Innovation Mission Hackathon
(
    'Atal Innovation Mission Hackathon',
    'NITI Aayog (Atal Innovation Mission)',
    '/logos/aim.svg',
    'Apr - Jun 2026',
    'upcoming',
    'https://aim.gov.in/hackathon',
    'Build solutions for EdTech, AgriTech, Health, and FinTech sectors.',
    'Indian students and innovators',
    ARRAY['EdTech', 'AgriTech', 'Health', 'FinTech'],
    '₹5-10 Lakhs + incubation support',
    'Online screening, bootcamp, demo day.',
    ARRAY['Full-Stack', 'Mobile', 'AI/ML', 'IoT'],
    '2026-04-01',
    '2026-06-30',
    '2026-03-01',
    '2026-04-15',
    true
);

-- Grant access to the service role
GRANT ALL ON mnc_hackathons TO service_role;
GRANT SELECT ON mnc_hackathons TO anon;
