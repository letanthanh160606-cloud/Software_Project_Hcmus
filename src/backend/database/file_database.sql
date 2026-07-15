--
-- PostgreSQL database dump
--

\restrict 5Ki9LEVkbumO8UI6TtDWGUL9oqObX7DPwrLaA6PFZn43THiSgsibXmJOdS3aOyF

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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
-- Name: Users; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Users";


ALTER SCHEMA "Users" OWNER TO postgres;

--
-- Name: workspaces; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA workspaces;


ALTER SCHEMA workspaces OWNER TO postgres;

--
-- Name: account_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_type_enum AS ENUM (
    'individual',
    'business'
);


ALTER TYPE public.account_type_enum OWNER TO postgres;

--
-- Name: asset_kind_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.asset_kind_enum AS ENUM (
    'prompt_template',
    'knowledge_base'
);


ALTER TYPE public.asset_kind_enum OWNER TO postgres;

--
-- Name: membership_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.membership_status_enum AS ENUM (
    'pending',
    'active',
    'removed'
);


ALTER TYPE public.membership_status_enum OWNER TO postgres;

--
-- Name: platform_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.platform_enum AS ENUM (
    'facebook',
    'linkedin'
);


ALTER TYPE public.platform_enum OWNER TO postgres;

--
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
-- Name: publish_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.publish_status_enum AS ENUM (
    'pending',
    'published',
    'failed'
);


ALTER TYPE public.publish_status_enum OWNER TO postgres;

--
-- Name: review_action_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_action_enum AS ENUM (
    'approve',
    'reject'
);


ALTER TYPE public.review_action_enum OWNER TO postgres;

--
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
-- Name: users; Type: TABLE; Schema: Users; Owner: postgres
--

CREATE TABLE "Users".users (
    users_uuid uuid DEFAULT uuidv7() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE "Users".users OWNER TO postgres;

--
-- Name: knowledge_base_documents; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.knowledge_base_documents (
    id uuid DEFAULT uuidv7() NOT NULL,
    owner_workspace_id uuid,
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
-- Name: posts; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.posts (
    id uuid DEFAULT uuidv7() NOT NULL,
    workspace_id uuid,
    author_id uuid NOT NULL,
    title text,
    content text DEFAULT ''::text NOT NULL,
    status public.post_status_enum DEFAULT 'draft'::public.post_status_enum NOT NULL,
    prompt_template_id uuid,
    knowledge_base_id uuid,
    ai_generated boolean DEFAULT false NOT NULL,
    seo_keywords jsonb,
    seo_hashtags jsonb,
    seo_score numeric(5,2),
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
-- Name: prompt_templates; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.prompt_templates (
    id uuid DEFAULT uuidv7() CONSTRAINT prompt_templates_prompt_templates_not_null NOT NULL,
    owner_workspace_id uuid,
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
-- Name: social_accounts; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.social_accounts (
    social_acc_id uuid DEFAULT uuidv7() NOT NULL,
    workspace_id uuid,
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
-- Name: workspace_members; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.workspace_members (
    user_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    status public.membership_status_enum DEFAULT 'active'::public.membership_status_enum NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    removed_at timestamp with time zone
);


ALTER TABLE workspaces.workspace_members OWNER TO postgres;

--
-- Name: workspaces; Type: TABLE; Schema: workspaces; Owner: postgres
--

CREATE TABLE workspaces.workspaces (
    workspace_uuid uuid DEFAULT uuidv7() NOT NULL,
    invite_code character varying(8) NOT NULL,
    slug character varying(50) NOT NULL,
    workspacename text NOT NULL,
    manager_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pin_hash text DEFAULT ''::text NOT NULL,
    CONSTRAINT slug_format CHECK (((slug)::text ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text)),
    CONSTRAINT slug_length CHECK (((char_length((slug)::text) >= 3) AND (char_length((slug)::text) <= 50)))
);


ALTER TABLE workspaces.workspaces OWNER TO postgres;

--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: Users; Owner: postgres
--

ALTER TABLE ONLY "Users".users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: Users; Owner: postgres
--

ALTER TABLE ONLY "Users".users
    ADD CONSTRAINT users_pkey PRIMARY KEY (users_uuid);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: Users; Owner: postgres
--

ALTER TABLE ONLY "Users".users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: knowledge_base_documents knowledge_base_documents_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.knowledge_base_documents
    ADD CONSTRAINT knowledge_base_documents_pkey PRIMARY KEY (id);


--
-- Name: post_analytics post_analytics_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_analytics
    ADD CONSTRAINT post_analytics_pkey PRIMARY KEY (id);


--
-- Name: post_media post_media_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_media
    ADD CONSTRAINT post_media_pkey PRIMARY KEY (id);


--
-- Name: post_platforms post_platforms_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_platforms
    ADD CONSTRAINT post_platforms_pkey PRIMARY KEY (id);


--
-- Name: post_platforms post_platforms_post_id_social_account_id_key; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_platforms
    ADD CONSTRAINT post_platforms_post_id_social_account_id_key UNIQUE (post_id, social_account_id);


--
-- Name: post_reviews post_reviews_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_reviews
    ADD CONSTRAINT post_reviews_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: prompt_templates prompt_templates_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.prompt_templates
    ADD CONSTRAINT prompt_templates_pkey PRIMARY KEY (id);


--
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (social_acc_id);


--
-- Name: social_accounts social_accounts_platform_platform_account_id_key; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_platform_platform_account_id_key UNIQUE (platform, platform_account_id);


--
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (user_id, workspace_id);


--
-- Name: workspaces workspaces_invite_code_key; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspaces
    ADD CONSTRAINT workspaces_invite_code_key UNIQUE (invite_code);


--
-- Name: workspaces workspaces_pin_hash_key; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspaces
    ADD CONSTRAINT workspaces_pin_hash_key UNIQUE (pin_hash);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (workspace_uuid);


--
-- Name: workspaces workspaces_slug_key; Type: CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspaces
    ADD CONSTRAINT workspaces_slug_key UNIQUE (slug);


--
-- Name: users_email_lower_idx; Type: INDEX; Schema: Users; Owner: postgres
--

CREATE UNIQUE INDEX users_email_lower_idx ON "Users".users USING btree (lower(email));


--
-- Name: users_username_lower_idx; Type: INDEX; Schema: Users; Owner: postgres
--

CREATE UNIQUE INDEX users_username_lower_idx ON "Users".users USING btree (lower(username));


--
-- Name: kb_documents_user_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX kb_documents_user_idx ON workspaces.knowledge_base_documents USING btree (owner_user_id) WHERE (NOT is_deleted);


--
-- Name: kb_documents_workspace_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX kb_documents_workspace_idx ON workspaces.knowledge_base_documents USING btree (owner_workspace_id) WHERE (NOT is_deleted);


--
-- Name: post_analytics_platform_time_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_analytics_platform_time_idx ON workspaces.post_analytics USING btree (post_platform_id, fetched_at DESC);


--
-- Name: post_media_post_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_media_post_idx ON workspaces.post_media USING btree (post_id);


--
-- Name: post_platforms_post_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_platforms_post_idx ON workspaces.post_platforms USING btree (post_id);


--
-- Name: post_platforms_status_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_platforms_status_idx ON workspaces.post_platforms USING btree (publish_status);


--
-- Name: post_reviews_post_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_reviews_post_idx ON workspaces.post_reviews USING btree (post_id);


--
-- Name: post_reviews_reviewer_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX post_reviews_reviewer_idx ON workspaces.post_reviews USING btree (reviewer_id);


--
-- Name: posts_author_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX posts_author_idx ON workspaces.posts USING btree (author_id);


--
-- Name: posts_status_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX posts_status_idx ON workspaces.posts USING btree (status);


--
-- Name: posts_workspace_status_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX posts_workspace_status_idx ON workspaces.posts USING btree (workspace_id, status);


--
-- Name: prompt_templates_user_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX prompt_templates_user_idx ON workspaces.prompt_templates USING btree (owner_user_id) WHERE (NOT is_deleted);


--
-- Name: prompt_templates_workspace_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX prompt_templates_workspace_idx ON workspaces.prompt_templates USING btree (owner_workspace_id) WHERE (NOT is_deleted);


--
-- Name: workspace_members_user_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX workspace_members_user_idx ON workspaces.workspace_members USING btree (user_id);


--
-- Name: workspace_members_workspace_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX workspace_members_workspace_idx ON workspaces.workspace_members USING btree (workspace_id);


--
-- Name: workspaces_manager_id_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE INDEX workspaces_manager_id_idx ON workspaces.workspaces USING btree (manager_id);


--
-- Name: workspaces_slug_lower_idx; Type: INDEX; Schema: workspaces; Owner: postgres
--

CREATE UNIQUE INDEX workspaces_slug_lower_idx ON workspaces.workspaces USING btree (lower((slug)::text));


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: Users; Owner: postgres
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON "Users".users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: knowledge_base_documents trg_kb_documents_updated_at; Type: TRIGGER; Schema: workspaces; Owner: postgres
--

CREATE TRIGGER trg_kb_documents_updated_at BEFORE UPDATE ON workspaces.knowledge_base_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: posts trg_posts_updated_at; Type: TRIGGER; Schema: workspaces; Owner: postgres
--

CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON workspaces.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: prompt_templates trg_prompt_templates_updated_at; Type: TRIGGER; Schema: workspaces; Owner: postgres
--

CREATE TRIGGER trg_prompt_templates_updated_at BEFORE UPDATE ON workspaces.prompt_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: workspaces trg_workspaces_updated_at; Type: TRIGGER; Schema: workspaces; Owner: postgres
--

CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON workspaces.workspaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: knowledge_base_documents knowledge_base_documents_created_by_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.knowledge_base_documents
    ADD CONSTRAINT knowledge_base_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES "Users".users(users_uuid);


--
-- Name: knowledge_base_documents knowledge_base_documents_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.knowledge_base_documents
    ADD CONSTRAINT knowledge_base_documents_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- Name: knowledge_base_documents knowledge_base_documents_owner_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.knowledge_base_documents
    ADD CONSTRAINT knowledge_base_documents_owner_workspace_id_fkey FOREIGN KEY (owner_workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- Name: post_analytics post_analytics_post_platform_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_analytics
    ADD CONSTRAINT post_analytics_post_platform_id_fkey FOREIGN KEY (post_platform_id) REFERENCES workspaces.post_platforms(id) ON DELETE CASCADE;


--
-- Name: post_media post_media_post_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_media
    ADD CONSTRAINT post_media_post_id_fkey FOREIGN KEY (post_id) REFERENCES workspaces.posts(id) ON DELETE CASCADE;


--
-- Name: post_platforms post_platforms_post_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_platforms
    ADD CONSTRAINT post_platforms_post_id_fkey FOREIGN KEY (post_id) REFERENCES workspaces.posts(id) ON DELETE CASCADE;


--
-- Name: post_platforms post_platforms_social_account_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_platforms
    ADD CONSTRAINT post_platforms_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES workspaces.social_accounts(social_acc_id) ON DELETE RESTRICT;


--
-- Name: post_reviews post_reviews_post_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_reviews
    ADD CONSTRAINT post_reviews_post_id_fkey FOREIGN KEY (post_id) REFERENCES workspaces.posts(id) ON DELETE CASCADE;


--
-- Name: post_reviews post_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.post_reviews
    ADD CONSTRAINT post_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES "Users".users(users_uuid);


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- Name: posts posts_knowledge_base_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_knowledge_base_id_fkey FOREIGN KEY (knowledge_base_id) REFERENCES workspaces.knowledge_base_documents(id) ON DELETE SET NULL;


--
-- Name: posts posts_prompt_template_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_prompt_template_id_fkey FOREIGN KEY (prompt_template_id) REFERENCES workspaces.prompt_templates(id) ON DELETE SET NULL;


--
-- Name: posts posts_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES "Users".users(users_uuid);


--
-- Name: posts posts_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.posts
    ADD CONSTRAINT posts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- Name: prompt_templates prompt_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.prompt_templates
    ADD CONSTRAINT prompt_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES "Users".users(users_uuid);


--
-- Name: prompt_templates prompt_templates_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.prompt_templates
    ADD CONSTRAINT prompt_templates_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- Name: prompt_templates prompt_templates_owner_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.prompt_templates
    ADD CONSTRAINT prompt_templates_owner_workspace_id_fkey FOREIGN KEY (owner_workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- Name: social_accounts social_accounts_connected_by_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_connected_by_fkey FOREIGN KEY (connected_by) REFERENCES "Users".users(users_uuid);


--
-- Name: social_accounts social_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- Name: social_accounts social_accounts_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.social_accounts
    ADD CONSTRAINT social_accounts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_user_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspace_members
    ADD CONSTRAINT workspace_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES "Users".users(users_uuid) ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_workspace_id_fkey; Type: FK CONSTRAINT; Schema: workspaces; Owner: postgres
--

ALTER TABLE ONLY workspaces.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces.workspaces(workspace_uuid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 5Ki9LEVkbumO8UI6TtDWGUL9oqObX7DPwrLaA6PFZn43THiSgsibXmJOdS3aOyF

