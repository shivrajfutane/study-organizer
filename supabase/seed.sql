-- ==============================================================================
-- STUDYSPACE SEED DATA FOR DEMO & TESTING
-- ==============================================================================

-- Starter Categories
-- Note: Replace '00000000-0000-0000-0000-000000000000' with actual user_id when running in Supabase SQL editor.
DO $$
DECLARE
    uid UUID := '00000000-0000-0000-0000-000000000000';
    cat_cyber UUID := gen_random_uuid();
    cat_cloud UUID := gen_random_uuid();
    cat_web UUID := gen_random_uuid();
    cat_dsa UUID := gen_random_uuid();
    cat_uni UUID := gen_random_uuid();
    cat_ai UUID := gen_random_uuid();
    
    sub_net UUID := gen_random_uuid();
    sub_aws UUID := gen_random_uuid();
    sub_react UUID := gen_random_uuid();
    sub_trees UUID := gen_random_uuid();
    
    mod_1 UUID := gen_random_uuid();
    
    proj_1 UUID := gen_random_uuid();
    rd_1 UUID := gen_random_uuid();
BEGIN
    -- Check if seed has already been inserted for dummy user
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Cybersecurity') THEN
        -- Insert Categories
        INSERT INTO public.categories (id, user_id, name, description, icon, color, weekly_target_hours) VALUES
        (cat_cyber, uid, 'Cybersecurity', 'Network security, penetration testing, and ethical hacking.', 'Shield', '#ec4899', 8),
        (cat_cloud, uid, 'Cloud Computing', 'AWS, Azure infrastructure, Docker, and Kubernetes.', 'Cloud', '#06b6d4', 6),
        (cat_web, uid, 'Web Development', 'Full-stack development with React, TypeScript, and Node.js.', 'Code', '#8b5cf6', 10),
        (cat_dsa, uid, 'Data Structures & Algorithms', 'Problem solving, dynamic programming, and complexity analysis.', 'Brain', '#10b981', 5),
        (cat_uni, uid, 'University Studies', 'Core academic modules and term examinations.', 'GraduationCap', '#f59e0b', 7),
        (cat_ai, uid, 'Artificial Intelligence', 'Machine learning foundations, neural networks, and LLMs.', 'Cpu', '#6366f1', 6);

        -- Insert Subjects
        INSERT INTO public.subjects (id, user_id, category_id, title, description, priority, status) VALUES
        (sub_net, uid, cat_cyber, 'Network Defense & Protocol Analysis', 'Wireshark analysis, TCP/IP stack vulnerabilities, and packet inspection.', 'high', 'in_progress'),
        (sub_aws, uid, cat_cloud, 'AWS Certified Solutions Architect', 'Core services: IAM, VPC, EC2, S3, RDS, ECS.', 'high', 'in_progress'),
        (sub_react, uid, cat_web, 'Advanced React Architecture', 'State management, custom hooks, Server Components, and WebSockets.', 'medium', 'in_progress'),
        (sub_trees, uid, cat_dsa, 'Graph Algorithms & Trees', 'DFS, BFS, Dijkstra, Trie, and Segment Trees.', 'high', 'in_progress');

        -- Insert Topics
        INSERT INTO public.topics (user_id, category_id, subject_id, title, status, estimated_minutes, actual_minutes) VALUES
        (uid, cat_cyber, sub_net, 'TCP 3-Way Handshake Analysis', 'completed', 45, 50),
        (uid, cat_cyber, sub_net, 'DNS Tunneling & Detection', 'completed', 60, 60),
        (uid, cat_cyber, sub_net, 'TLS 1.3 Key Exchange Mechanics', 'in_progress', 90, 30),
        (uid, cat_cyber, sub_net, 'ARP Spoofing & Mitigation with DAI', 'not_started', 60, 0),
        (uid, cat_cloud, sub_aws, 'IAM Policies & Role Assumption', 'completed', 60, 65),
        (uid, cat_cloud, sub_aws, 'VPC Peering vs Transit Gateway', 'completed', 75, 75),
        (uid, cat_cloud, sub_aws, 'Auto Scaling Lifecycle Hooks', 'in_progress', 60, 20),
        (uid, cat_cloud, sub_aws, 'Aurora Multi-Master Replication', 'not_started', 90, 0),
        (uid, cat_web, sub_react, 'React 19 Actions & useActionState', 'completed', 60, 60),
        (uid, cat_web, sub_react, 'React Virtualization for High-Volume Feeds', 'in_progress', 80, 45),
        (uid, cat_dsa, sub_trees, 'Dijkstra Shortest Path with Priority Queue', 'completed', 90, 85),
        (uid, cat_dsa, sub_trees, 'Lowest Common Ancestor in Binary Trees', 'completed', 45, 45);

        -- Insert Roadmaps
        INSERT INTO public.roadmaps (id, user_id, category_id, title, description, priority, status, target_date) VALUES
        (rd_1, uid, cat_cloud, 'Cloud Architect 2026 Mastery', 'Complete track from cloud foundations to multi-region disaster recovery.', 'high', 'in_progress', CURRENT_DATE + INTERVAL '60 days');

        INSERT INTO public.roadmap_milestones (roadmap_id, user_id, title, description, is_completed, sort_order) VALUES
        (rd_1, uid, 'AWS SAA-C03 Certification Exam', 'Pass official exam with 850+ score', false, 1),
        (rd_1, uid, 'Deploy Multi-Region Terraform Infrastructure', 'IaC pipeline for high availability', false, 2),
        (rd_1, uid, 'Kubernetes (CKA) Production Lab', 'Deploy microservices cluster with Linkerd', false, 3);

        -- Insert Projects
        INSERT INTO public.projects (id, user_id, category_id, name, description, status, priority, github_url, tech_stack) VALUES
        (proj_1, uid, cat_web, 'StudySpace Web App', 'Personal study command center with focus workspace and real-time analytics.', 'in_progress', 'high', 'https://github.com/example/studyspace', ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Supabase']);

        -- Insert Tasks
        INSERT INTO public.tasks (user_id, category_id, subject_id, project_id, title, priority, status, due_date, estimated_minutes, is_today_plan) VALUES
        (uid, cat_web, sub_react, proj_1, 'Implement Pomodoro timer audio alerts', 'high', 'completed', CURRENT_DATE, 40, true),
        (uid, cat_cloud, sub_aws, NULL, 'Review AWS Transit Gateway architecture diagrams', 'medium', 'pending', CURRENT_DATE, 45, true),
        (uid, cat_dsa, sub_trees, NULL, 'Solve 3 LeetCode Hard graph problems', 'high', 'pending', CURRENT_DATE, 90, true),
        (uid, cat_cyber, sub_net, NULL, 'Capture packet dump of TLS handshake in Wireshark', 'low', 'pending', CURRENT_DATE + INTERVAL '2 days', 30, false);

        -- Insert Goals
        INSERT INTO public.goals (user_id, category_id, title, description, period, target_value, current_value, unit) VALUES
        (uid, cat_cloud, 'Complete AWS Solutions Architect Course', 'Finish all 18 modules before exam date', 'monthly', 18, 12, 'modules'),
        (uid, cat_dsa, 'Solve 50 LeetCode Medium/Hard Questions', 'Prepare for upcoming technical interviews', 'monthly', 50, 28, 'problems'),
        (uid, cat_web, 'Study 12 Hours This Week', 'Consistent daily focus sessions', 'weekly', 12, 8.5, 'hours');

        -- Insert Playlists
        INSERT INTO public.saved_playlists (user_id, category_id, name, url, video_or_playlist_id, type, mood, is_favorite) VALUES
        (uid, NULL, 'Lofi Girl - Synthwave Radio chill beats to study', 'https://www.youtube.com/watch?v=4xDzrJKXOOY', '4xDzrJKXOOY', 'video', 'synthwave', true),
        (uid, NULL, 'Lofi Girl - beats to relax/study to', 'https://www.youtube.com/watch?v=jfKfPfyJRdk', 'jfKfPfyJRdk', 'video', 'lofi', true),
        (uid, NULL, 'Peaceful Classical Music for Deep Focus', 'https://www.youtube.com/watch?v=WPni755-Krg', 'WPni755-Krg', 'video', 'classical', false);

        -- Insert Study Sessions
        INSERT INTO public.study_sessions (user_id, category_id, subject_id, session_type, duration_minutes, started_at, ended_at, is_completed) VALUES
        (uid, cat_web, sub_react, 'pomodoro', 25, now() - INTERVAL '2 hours', now() - INTERVAL '1 hour 35 minutes', true),
        (uid, cat_cloud, sub_aws, 'pomodoro', 50, now() - INTERVAL '1 day', now() - INTERVAL '1 day' + INTERVAL '50 minutes', true),
        (uid, cat_dsa, sub_trees, 'pomodoro', 25, now() - INTERVAL '2 days', now() - INTERVAL '2 days' + INTERVAL '25 minutes', true);
    END IF;
END $$;
