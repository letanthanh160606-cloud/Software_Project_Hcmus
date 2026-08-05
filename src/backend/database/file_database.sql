--
-- PostgreSQL database dump
--

\restrict 1wmV8dj0JF8efmI8WsaAehAgx0VygMmZrD5XTmOMdMly8mk9O1AKCKBwDHnWscj

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-08-05 16:52:00

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 19644)
-- Name: Users; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Users";


ALTER SCHEMA "Users" OWNER TO postgres;

--
-- TOC entry 7 (class 2615 OID 19645)
-- Name: workspaces; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA workspaces;


ALTER SCHEMA workspaces OWNER TO postgres;

--
-- TOC entry 868 (class 1247 OID 19647)
-- Name: account_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_type_enum AS ENUM (
    'individual',
    'business'
);


ALTER TYPE public.account_type_enum OWNER TO postgres;

--
-- TOC entry 871 (class 1247 OID 19652)
-- Name: asset_kind_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.asset_kind_enum AS ENUM (
    'prompt_template',
    'knowledge_base'
);


ALTER TYPE public.asset_kind_enum OWNER TO postgres;

--
-- TOC entry 874 (class 1247 OID 19658)
-- Name: membership_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.membership_status_enum AS ENUM (
    'pending',
    'active',
    'removed'
);


ALTER TYPE public.membership_status_enum OWNER TO postgres;

--
-- TOC entry 877 (class 1247 OID 19666)
-- Name: platform_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.platform_enum AS ENUM (
    'facebook',
    'linkedin'
);


ALTER TYPE public.platform_enum OWNER TO postgres;

--
-- TOC entry 880 (class 1247 OID 19672)
-- Name: post_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.post_status_enum AS ENUM (
    'draft',
    'pending_review',
    'rejected',
    'ready_for_distribution',
    'published',
    'failed'
);


ALTER TYPE public.post_status_enum OWNER TO postgres;

--
-- TOC entry 883 (class 1247 OID 19686)
-- Name: publish_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.publish_status_enum AS ENUM (
    'pending',
    'published',
    'failed'
);


ALTER TYPE public.publish_status_enum OWNER TO postgres;

--
-- TOC entry 886 (class 1247 OID 19694)
-- Name: review_action_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_action_enum AS ENUM (
    'approve',
    'reject'
);


ALTER TYPE public.review_action_enum OWNER TO postgres;

--
-- TOC entry 925 (class 1247 OID 20054)
-- Name: task_priority_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_priority_enum AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE public.task_priority_enum OWNER TO postgres;

--
-- TOC entry 922 (class 1247 OID 20042)
-- Name: task_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_status_enum AS ENUM (
    'todo',
    'in_progress',
    'review',
    'completed',
    'cancelled'
);


ALTER TYPE public.task_status_enum OWNER TO postgres;

--
-- TOC entry 235 (class 1255 OID 19700)
-- Name: generate_workspace_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_workspace_id() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- bỏ ký tự dễ nhầm: I, L, O, 0, 1
    result text;
    i integer;
    new_id character varying(16);
    already_used boolean;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..16 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        new_id := result;
        SELECT EXISTS (
            SELECT 1 FROM workspaces.workspaces WHERE workspace_uuid = new_id
        ) INTO already_used;
        EXIT WHEN NOT already_used;
    END LOOP;
    RETURN new_id;
END;
$$;


ALTER FUNCTION public.generate_workspace_id() OWNER TO postgres;

--
-- TOC entry 234 (class 1255 OID 19699)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 19701)
-- Name: users; Type: TABLE; Schema: Users; Owner: postgres
--

CREATE TABLE "Users".users (
    users_uuid uuid DEFAULT uuidv7() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    account_type public.account_type_enum DEFAULT 'individual'::public.account_type_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL
);


ALTER TABLE "Users".users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 19717)
-- Name: knowledge_base_documents; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.knowledge_base_documents (
    id uuid DEFAULT uuidv7() NOT NULL,
    owner_workspace_id character varying(16),
    owner_user_id uuid,
    title text NOT NULL,
    file_path text NOT NULL,
    file_size_bytes bigint NOT NULL,
    mime_type text NOT NULL,
    tag text,
    created_by uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT file_size_limit CHECK ((file_size_bytes <= ((5 * 1024) * 1024))),
    CONSTRAINT owner_exclusive CHECK ((((owner_workspace_id IS NOT NULL) AND (owner_user_id IS NULL)) OR ((owner_workspace_id IS NULL) AND (owner_user_id IS NOT NULL))))
);


ALTER TABLE workspaces.knowledge_base_documents OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 19737)
-- Name: post_analytics; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.post_analytics (
    id uuid DEFAULT uuidv7() NOT NULL,
    post_platform_id uuid NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    comments integer DEFAULT 0 NOT NULL,
    shares integer DEFAULT 0 NOT NULL,
    impressions integer DEFAULT 0 NOT NULL,
    is_cached boolean DEFAULT false NOT NULL,
    fetched_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE workspaces.post_analytics OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 19755)
-- Name: post_media; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.post_media (
    id uuid DEFAULT uuidv7() NOT NULL,
    post_id uuid NOT NULL,
    image_url text NOT NULL,
    "position" smallint DEFAULT 0 NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE workspaces.post_media OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 19768)
-- Name: post_platforms; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.post_platforms (
    id uuid DEFAULT uuidv7() NOT NULL,
    post_id uuid NOT NULL,
    social_account_id uuid NOT NULL,
    platform public.platform_enum NOT NULL,
    publish_status public.publish_status_enum DEFAULT 'pending'::public.publish_status_enum NOT NULL,
    platform_post_id text,
    platform_post_url text,
    retry_count smallint DEFAULT 0 NOT NULL,
    error_message text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE workspaces.post_platforms OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 19784)
-- Name: post_reviews; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.post_reviews (
    id uuid DEFAULT uuidv7() NOT NULL,
    post_id uuid NOT NULL,
    reviewer_id uuid NOT NULL,
    action public.review_action_enum NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE workspaces.post_reviews OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 19796)
-- Name: posts; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.posts (
    id uuid DEFAULT uuidv7() NOT NULL,
    workspace_id character varying(16),
    author_id uuid NOT NULL,
    title text,
    content text DEFAULT ''::text NOT NULL,
    status public.post_status_enum DEFAULT 'draft'::public.post_status_enum NOT NULL,
    prompt_template_id uuid,
    knowledge_base_id uuid,
    ai_generated boolean DEFAULT false NOT NULL,
    seo_keywords jsonb,
    seo_hashtags jsonb,
    submitted_at timestamp with time zone,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    reject_reason text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT content_required_on_submit CHECK (((status = 'draft'::public.post_status_enum) OR (char_length(TRIM(BOTH FROM content)) > 0)))
);


ALTER TABLE workspaces.posts OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 19815)
-- Name: prompt_templates; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.prompt_templates (
    id uuid DEFAULT uuidv7() CONSTRAINT prompt_templates_prompt_templates_not_null NOT NULL,
    owner_workspace_id character varying(16),
    owner_user_id uuid,
    title text NOT NULL,
    content text NOT NULL,
    tag text,
    created_by uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT owner_exclusive CHECK ((((owner_workspace_id IS NOT NULL) AND (owner_user_id IS NULL)) OR ((owner_workspace_id IS NULL) AND (owner_user_id IS NOT NULL))))
);


ALTER TABLE workspaces.prompt_templates OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 19832)
-- Name: social_accounts; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.social_accounts (
    social_acc_id uuid DEFAULT uuidv7() NOT NULL,
    workspace_id character varying(16),
    user_id uuid,
    platform public.platform_enum NOT NULL,
    platform_account_id text NOT NULL,
    platform_account_name text NOT NULL,
    access_token_encrypted text NOT NULL,
    refresh_token_encrypted text,
    token_expires_at timestamp with time zone,
    connected_by uuid NOT NULL,
    status text DEFAULT 'connected'::text NOT NULL,
    connected_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT owner_exclusive CHECK ((((workspace_id IS NOT NULL) AND (user_id IS NULL)) OR ((workspace_id IS NULL) AND (user_id IS NOT NULL))))
);


ALTER TABLE workspaces.social_accounts OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 20083)
-- Name: task_attachments; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.task_attachments (
    id uuid DEFAULT uuidv7() NOT NULL,
    task_id uuid NOT NULL,
    image_url text NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE workspaces.task_attachments OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 20063)
-- Name: tasks; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.tasks (
    id uuid DEFAULT uuidv7() NOT NULL,
    workspace_id character varying(16),
    title text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    status public.task_status_enum DEFAULT 'todo'::public.task_status_enum NOT NULL,
    priority public.task_priority_enum DEFAULT 'medium'::public.task_priority_enum NOT NULL,
    assigned_to uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    due_date timestamp with time zone
);


ALTER TABLE workspaces.tasks OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 19851)
-- Name: workspace_members; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.workspace_members (
    user_id uuid NOT NULL,
    workspace_id character varying(16) NOT NULL,
    status public.membership_status_enum DEFAULT 'active'::public.membership_status_enum NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    removed_at timestamp with time zone
);


ALTER TABLE workspaces.workspace_members OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 19860)
-- Name: workspaces; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.workspaces (
    workspace_uuid character varying(16) DEFAULT public.generate_workspace_id() NOT NULL,
    workspacename text NOT NULL,
    manager_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pin_hash text DEFAULT ''::text NOT NULL,
    CONSTRAINT workspace_uuid_length CHECK ((char_length((workspace_uuid)::text) = 16))
);


ALTER TABLE workspaces.workspaces OWNER TO postgres;

--
-- TOC entry 5232 (class 0 OID 19701)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: Users; Owner: postgres
--

COPY "Users".users (users_uuid, username, email, password_hash, account_type, created_at, updated_at, is_email_verified) FROM stdin;
fefa39e8-4498-42ab-826d-e1fd53fbe850	nhuan1	nhuan1@gmail.com	$argon2id$v=19$m=19456,t=2,p=1$yFmLsTaGMMaYcw7BeO9daw$Z7DqHaRzhRbUlKFI0u2XIvqdvA513LqBQ58z4x2/Azk	individual	2026-07-30 17:08:42.486412+07	2026-07-30 17:08:42.486412+07	f
5f67d737-fcfa-43c0-8f47-15bc183e8ff9	nhuan2	nhuan2@gmail.com	$argon2id$v=19$m=19456,t=2,p=1$OYdwrvVei/Heu5ey9l5rTQ$WTusPU4rtVbw4T6YtR3E9zNCVO4W+1wLoT5jv0OQYjQ	business	2026-07-30 17:09:20.112439+07	2026-07-30 17:09:20.112439+07	f
8c2a9a81-8b7c-4283-af16-df41b6ba7680	nhuan3	nhuan3@gmail.com	$argon2id$v=19$m=19456,t=2,p=1$pJRSqnXOmbOW8h6j1Nq7Vw$q/58VtiBLxj4HtMADOTYbeo+hZDs2zoTynkcXD4Penk	business	2026-07-30 17:10:15.080984+07	2026-07-30 17:10:15.080984+07	f
25092c53-2d87-483e-82e2-83f84c6511e2	nhuan4	nhuan4@gmail.com	$argon2id$v=19$m=19456,t=2,p=1$FqL0vleqNaZUijGGUMqZ8w$liP8uQlqJA6tFV6T7abDC3p62jDIWCMb/nY8YHf+jD4	business	2026-07-30 17:10:44.889379+07	2026-07-30 17:10:44.889379+07	f
c140ec88-be23-4330-b901-3c072aefa71d	nhuan5	nhuan5@gmail.com	$argon2id$v=19$m=19456,t=2,p=1$957zvteasxbinFOqNUao9Q$VEcryCpxjtjeRHiYZ4o1KqkNchcK2Eg3CdrRgqhOqL4	individual	2026-07-30 18:27:51.694596+07	2026-07-30 18:27:51.694596+07	f
\.


--
-- TOC entry 5233 (class 0 OID 19717)
-- Dependencies: 222
-- Data for Name: knowledge_base_documents; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.knowledge_base_documents (id, owner_workspace_id, owner_user_id, title, file_path, file_size_bytes, mime_type, tag, created_by, is_deleted, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5234 (class 0 OID 19737)
-- Dependencies: 223
-- Data for Name: post_analytics; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.post_analytics (id, post_platform_id, likes, comments, shares, impressions, is_cached, fetched_at) FROM stdin;
\.


--
-- TOC entry 5235 (class 0 OID 19755)
-- Dependencies: 224
-- Data for Name: post_media; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.post_media (id, post_id, image_url, "position", uploaded_at) FROM stdin;
\.


--
-- TOC entry 5236 (class 0 OID 19768)
-- Dependencies: 225
-- Data for Name: post_platforms; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.post_platforms (id, post_id, social_account_id, platform, publish_status, platform_post_id, platform_post_url, retry_count, error_message, published_at, created_at) FROM stdin;
\.


--
-- TOC entry 5237 (class 0 OID 19784)
-- Dependencies: 226
-- Data for Name: post_reviews; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.post_reviews (id, post_id, reviewer_id, action, comment, created_at) FROM stdin;
\.


--
-- TOC entry 5238 (class 0 OID 19796)
-- Dependencies: 227
-- Data for Name: posts; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.posts (id, workspace_id, author_id, title, content, status, prompt_template_id, knowledge_base_id, ai_generated, seo_keywords, seo_hashtags, submitted_at, reviewed_by, reviewed_at, reject_reason, published_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5239 (class 0 OID 19815)
-- Dependencies: 228
-- Data for Name: prompt_templates; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.prompt_templates (id, owner_workspace_id, owner_user_id, title, content, tag, created_by, is_deleted, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5240 (class 0 OID 19832)
-- Dependencies: 229
-- Data for Name: social_accounts; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.social_accounts (social_acc_id, workspace_id, user_id, platform, platform_account_id, platform_account_name, access_token_encrypted, refresh_token_encrypted, token_expires_at, connected_by, status, connected_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5244 (class 0 OID 20083)
-- Dependencies: 233
-- Data for Name: task_attachments; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.task_attachments (id, task_id, image_url, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5243 (class 0 OID 20063)
-- Dependencies: 232
-- Data for Name: tasks; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.tasks (id, workspace_id, title, content, status, priority, assigned_to, created_at, updated_at, created_by, due_date) FROM stdin;
019fb2a8-e66c-795a-b43d-2d322b780363	FP7WBB62N7VTRUWY	huphup	blavlavalvav	todo	high	25092c53-2d87-483e-82e2-83f84c6511e2	2026-07-30 17:54:01.314148+07	2026-08-05 15:15:02.031835+07	25092c53-2d87-483e-82e2-83f84c6511e2	\N
\.


--
-- TOC entry 5241 (class 0 OID 19851)
-- Dependencies: 230
-- Data for Name: workspace_members; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.workspace_members (user_id, workspace_id, status, joined_at, removed_at) FROM stdin;
25092c53-2d87-483e-82e2-83f84c6511e2	FP7WBB62N7VTRUWY	active	2026-07-30 17:10:44.889379+07	\N
8c2a9a81-8b7c-4283-af16-df41b6ba7680	FP7WBB62N7VTRUWY	removed	2026-07-30 17:10:15.080984+07	2026-07-30 17:56:28.98093+07
\.


--
-- TOC entry 5242 (class 0 OID 19860)
-- Dependencies: 231
-- Data for Name: workspaces; Type: TABLE DATA; Schema: workspaces; Owner: postgres
--

COPY workspaces.workspaces (workspace_uuid, workspacename, manager_id, created_at, updated_at, pin_hash) FROM stdin;
FP7WBB62N7VTRUWY	nhuan2	5f67d737-fcfa-43c0-8f47-15bc183e8ff9	2026-07-30 17:09:20.112439+07	2026-07-30 17:09:20.112439+07	$argon2id$v=19$m=19456,t=2,p=1$8l5rTSkFIMT4P2eMkRICgA$C0GqUznbRsoj09vExDW+jgT5bnjsyfjYcaDH4Lc2aS8
\.


--
-- TOC entry 4994 (class 2606 OID 19877)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: Users; Owner: postgres
--

ALTER TABLE ONLY "Users".users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4997 (class 2606 OID 19879)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: Users; Owner: postgres
--

ALTER TABLE ONLY "Users".users
    ADD CONSTRAINT users_pkey PRIMARY KEY (users_uuid);


--
-- TOC entry 4999 (class 2606 OID 19881)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: Users; Owner: postgres
--

ALTER TABLE ONLY "Users".users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5004 (class 2606 OID 19883)
-- Name: knowledge_base_documents knowledge_base_documents_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.knowledge_base_documents
    ADD CONSTRAINT knowledge_base_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 19885)
-- Name: post_analytics post_analytics_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_analytics
    ADD CONSTRAINT post_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 19887)
-- Name: post_media post_media_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_media
    ADD CONSTRAINT post_media_pkey PRIMARY KEY (id);


--
-- TOC entry 5012 (class 2606 OID 19889)
-- Name: post_platforms post_platforms_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_platforms
    ADD CONSTRAINT post_platforms_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 19891)
-- Name: post_platforms post_platforms_post_id_social_account_id_key; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_platforms
    ADD CONSTRAINT post_platforms_post_id_social_account_id_key UNIQUE (post_id, social_account_id);


--
-- TOC entry 5018 (class 2606 OID 19893)
-- Name: post_reviews post_reviews_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_reviews
    ADD CONSTRAINT post_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5023 (class 2606 OID 19895)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 5027 (class 2606 OID 19897)
-- Name: prompt_templates prompt_templates_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.prompt_templates
    ADD CONSTRAINT prompt_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 19899)
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (social_acc_id);


--
-- TOC entry 5033 (class 2606 OID 19901)
-- Name: social_accounts social_accounts_platform_platform_account_id_key; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_platform_platform_account_id_key UNIQUE (platform, platform_account_id);


--
-- TOC entry 5051 (class 2606 OID 20097)
-- Name: task_attachments task_attachments_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.task_attachments
    ADD CONSTRAINT task_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 20095)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 19903)
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (user_id, workspace_id);


--
-- TOC entry 5040 (class 2606 OID 19905)
-- Name: workspaces workspaces_pin_hash_key; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspaces
    ADD CONSTRAINT workspaces_pin_hash_key UNIQUE (pin_hash);


--
-- TOC entry 5042 (class 2606 OID 19907)
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (workspace_uuid);


--
-- TOC entry 4995 (class 1259 OID 19908)
-- Name: users_email_lower_idx; Type: INDEX; Schema: Users; Owner: postgres
--

CREATE UNIQUE INDEX users_email_lower_idx ON "Users".users USING btree (lower(email));


--
-- TOC entry 5000 (class 1259 OID 19909)
-- Name: users_username_lower_idx; Type: INDEX; Schema: Users; Owner: postgres
--

CREATE UNIQUE INDEX users_username_lower_idx ON "Users".users USING btree (lower(username));


--
-- TOC entry 5001 (class 1259 OID 19910)
-- Name: kb_documents_user_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX kb_documents_user_idx ON workspaces.knowledge_base_documents USING btree (owner_user_id) WHERE (NOT is_deleted);


--
-- TOC entry 5002 (class 1259 OID 19911)
-- Name: kb_documents_workspace_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX kb_documents_workspace_idx ON workspaces.knowledge_base_documents USING btree (owner_workspace_id) WHERE (NOT is_deleted);


--
-- TOC entry 5007 (class 1259 OID 19912)
-- Name: post_analytics_platform_time_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_analytics_platform_time_idx ON workspaces.post_analytics USING btree (post_platform_id, fetched_at DESC);


--
-- TOC entry 5010 (class 1259 OID 19913)
-- Name: post_media_post_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_media_post_idx ON workspaces.post_media USING btree (post_id);


--
-- TOC entry 5015 (class 1259 OID 19914)
-- Name: post_platforms_post_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_platforms_post_idx ON workspaces.post_platforms USING btree (post_id);


--
-- TOC entry 5016 (class 1259 OID 19915)
-- Name: post_platforms_status_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_platforms_status_idx ON workspaces.post_platforms USING btree (publish_status);


--
-- TOC entry 5019 (class 1259 OID 19916)
-- Name: post_reviews_post_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_reviews_post_idx ON workspaces.post_reviews USING btree (post_id);


--
-- TOC entry 5020 (class 1259 OID 19917)
-- Name: post_reviews_reviewer_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_reviews_reviewer_idx ON workspaces.post_reviews USING btree (reviewer_id);


--
-- TOC entry 5021 (class 1259 OID 19918)
-- Name: posts_author_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX posts_author_idx ON workspaces.posts USING btree (author_id);


--
-- TOC entry 5024 (class 1259 OID 19919)
-- Name: posts_status_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX posts_status_idx ON workspaces.posts USING btree (status);


--
-- TOC entry 5025 (class 1259 OID 19920)
-- Name: posts_workspace_status_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX posts_workspace_status_idx ON workspaces.posts USING btree (workspace_id, status);


--
-- TOC entry 5028 (class 1259 OID 19921)
-- Name: prompt_templates_user_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX prompt_templates_user_idx ON workspaces.prompt_templates USING btree (owner_user_id) WHERE (NOT is_deleted);


--
-- TOC entry 5029 (class 1259 OID 19922)
-- Name: prompt_templates_workspace_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX prompt_templates_workspace_idx ON workspaces.prompt_templates USING btree (owner_workspace_id) WHERE (NOT is_deleted);


--
-- TOC entry 5052 (class 1259 OID 20100)
-- Name: task_attachments_task_id_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX task_attachments_task_id_idx ON workspaces.task_attachments USING btree (task_id);


--
-- TOC entry 5043 (class 1259 OID 20101)
-- Name: tasks_assigned_to_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX tasks_assigned_to_idx ON workspaces.tasks USING btree (assigned_to);


--
-- TOC entry 5044 (class 1259 OID 20127)
-- Name: tasks_created_by_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX tasks_created_by_idx ON workspaces.tasks USING btree (created_by);


--
-- TOC entry 5045 (class 1259 OID 20128)
-- Name: tasks_due_date_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX tasks_due_date_idx ON workspaces.tasks USING btree (due_date);


--
-- TOC entry 5048 (class 1259 OID 20099)
-- Name: tasks_status_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX tasks_status_idx ON workspaces.tasks USING btree (status);


--
-- TOC entry 5049 (class 1259 OID 20098)
-- Name: tasks_workspace_id_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX tasks_workspace_id_idx ON workspaces.tasks USING btree (workspace_id);


--
-- TOC entry 5036 (class 1259 OID 19923)
-- Name: workspace_members_user_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX workspace_members_user_idx ON workspaces.workspace_members USING btree (user_id);


--
-- TOC entry 5037 (class 1259 OID 19924)
-- Name: workspace_members_workspace_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX workspace_members_workspace_idx ON workspaces.workspace_members USING btree (workspace_id);


--
-- TOC entry 5038 (class 1259 OID 19925)
-- Name: workspaces_manager_id_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX workspaces_manager_id_idx ON workspaces.workspaces USING btree (manager_id);


--
-- TOC entry 5079 (class 2620 OID 19926)
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: Users; Owner: postgres
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON "Users".users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5080 (class 2620 OID 19927)
-- Name: knowledge_base_documents trg_kb_documents_updated_at; Type: TRIGGER; Schema: workspaces; Owner: postgres
--

CREATE TRIGGER trg_kb_documents_updated_at BEFORE UPDATE ON workspaces.knowledge_base_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5081 (class 2620 OID 19928)
-- Name: posts trg_posts_updated_at; Type: TRIGGER; Schema: workspaces; Owner: postgres
--

CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON workspaces.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5082 (class 2620 OID 19929)
-- Name: prompt_templates trg_prompt_templates_updated_at; Type: TRIGGER; Schema: workspaces; Owner: postgres
--

CREATE TRIGGER trg_prompt_templates_updated_at BEFORE UPDATE ON workspaces.prompt_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5084 (class 2620 OID 20102)
-- Name: tasks trg_tasks_updated_at; Type: TRIGGER; Schema: workspaces; Owner: postgres
--

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON workspaces.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5083 (class 2620 OID 19930)
-- Name: workspaces trg_workspaces_updated_at; Type: TRIGGER; Schema: workspaces; Owner: postgres
--

CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON workspaces.workspaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5053 (class 2606 OID 19931)
-- Name: knowledge_base_documents knowledge_base_documents_created_by_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.knowledge_base_documents
    ADD CONSTRAINT knowledge_base_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES "Users".users(users_uuid);


--
-- TOC entry 5054 (class 2606 OID 19936)
-- Name: knowledge_base_documents knowledge_base_documents_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.knowledge_base_documents
    ADD CONSTRAINT knowledge_base_documents_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- TOC entry 5055 (class 2606 OID 19941)
-- Name: knowledge_base_documents knowledge_base_documents_owner_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.knowledge_base_documents
    ADD CONSTRAINT knowledge_base_documents_owner_workspace_id_fkey FOREIGN KEY (owner_workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- TOC entry 5056 (class 2606 OID 19946)
-- Name: post_analytics post_analytics_post_platform_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_analytics
    ADD CONSTRAINT post_analytics_post_platform_id_fkey FOREIGN KEY (post_platform_id) REFERENCES workspaces.post_platforms(id) ON DELETE CASCADE;


--
-- TOC entry 5057 (class 2606 OID 19951)
-- Name: post_media post_media_post_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_media
    ADD CONSTRAINT post_media_post_id_fkey FOREIGN KEY (post_id) REFERENCES workspaces.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5058 (class 2606 OID 19956)
-- Name: post_platforms post_platforms_post_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_platforms
    ADD CONSTRAINT post_platforms_post_id_fkey FOREIGN KEY (post_id) REFERENCES workspaces.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5059 (class 2606 OID 19961)
-- Name: post_platforms post_platforms_social_account_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_platforms
    ADD CONSTRAINT post_platforms_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES workspaces.social_accounts(social_acc_id) ON DELETE RESTRICT;


--
-- TOC entry 5060 (class 2606 OID 19966)
-- Name: post_reviews post_reviews_post_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_reviews
    ADD CONSTRAINT post_reviews_post_id_fkey FOREIGN KEY (post_id) REFERENCES workspaces.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5061 (class 2606 OID 19971)
-- Name: post_reviews post_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_reviews
    ADD CONSTRAINT post_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES "Users".users(users_uuid);


--
-- TOC entry 5062 (class 2606 OID 19976)
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- TOC entry 5063 (class 2606 OID 19981)
-- Name: posts posts_knowledge_base_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_knowledge_base_id_fkey FOREIGN KEY (knowledge_base_id) REFERENCES workspaces.knowledge_base_documents(id) ON DELETE SET NULL;


--
-- TOC entry 5064 (class 2606 OID 19986)
-- Name: posts posts_prompt_template_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_prompt_template_id_fkey FOREIGN KEY (prompt_template_id) REFERENCES workspaces.prompt_templates(id) ON DELETE SET NULL;


--
-- TOC entry 5065 (class 2606 OID 19991)
-- Name: posts posts_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES "Users".users(users_uuid);


--
-- TOC entry 5066 (class 2606 OID 19996)
-- Name: posts posts_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 20001)
-- Name: prompt_templates prompt_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.prompt_templates
    ADD CONSTRAINT prompt_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES "Users".users(users_uuid);


--
-- TOC entry 5068 (class 2606 OID 20006)
-- Name: prompt_templates prompt_templates_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.prompt_templates
    ADD CONSTRAINT prompt_templates_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- TOC entry 5069 (class 2606 OID 20011)
-- Name: prompt_templates prompt_templates_owner_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.prompt_templates
    ADD CONSTRAINT prompt_templates_owner_workspace_id_fkey FOREIGN KEY (owner_workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- TOC entry 5070 (class 2606 OID 20016)
-- Name: social_accounts social_accounts_connected_by_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_connected_by_fkey FOREIGN KEY (connected_by) REFERENCES "Users".users(users_uuid);


--
-- TOC entry 5071 (class 2606 OID 20021)
-- Name: social_accounts social_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- TOC entry 5072 (class 2606 OID 20026)
-- Name: social_accounts social_accounts_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- TOC entry 5078 (class 2606 OID 20108)
-- Name: task_attachments task_attachments_task_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.task_attachments
    ADD CONSTRAINT task_attachments_task_id_fkey FOREIGN KEY (task_id) REFERENCES workspaces.tasks(id) ON DELETE CASCADE;


--
-- TOC entry 5075 (class 2606 OID 20113)
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES "Users".users(users_uuid) ON DELETE SET NULL;


--
-- TOC entry 5076 (class 2606 OID 20122)
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES "Users".users(users_uuid);


--
-- TOC entry 5077 (class 2606 OID 20103)
-- Name: tasks tasks_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.tasks
    ADD CONSTRAINT tasks_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- TOC entry 5073 (class 2606 OID 20031)
-- Name: workspace_members workspace_members_user_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspace_members
    ADD CONSTRAINT workspace_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- TOC entry 5074 (class 2606 OID 20036)
-- Name: workspace_members workspace_members_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


-- Completed on 2026-08-05 16:52:01

--
-- PostgreSQL database dump complete
--

\unrestrict 1wmV8dj0JF8efmI8WsaAehAgx0VygMmZrD5XTmOMdMly8mk9O1AKCKBwDHnWscj

