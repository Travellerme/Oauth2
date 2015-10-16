--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: auth; Type: COMMENT; Schema: -; Owner: postgres
--
CREATE DATABASE auth owner postgres;

\connect auth;

CREATE TABLE "user" (
    id integer NOT NULL,
    username character varying(255) DEFAULT NULL::character varying,
    salt character varying(32) DEFAULT NULL::character varying,
    password character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public."user" OWNER TO postgres;

insert into "user" (id, username, salt, password) values (302510,'test','ef116037a5afd5b29697f3daaaa851e0','fd7fbbdc0d702855c2dc81943649e214a9cd35ddef3687c67099c5391a19fbe608da629e5935c211d2ef8d3b24af2b53eecc98a736d85528ee4edb9742cfb389');
--COPY "user" (id, username, salt, password) FROM stdin;
--302510	test	ef116037a5afd5b29697f3daaaa851e0	fd7fbbdc0d702855c2dc81943649e214a9cd35ddef3687c67099c5391a19fbe608da629e5935c211d2ef8d3b24af2b53eecc98a736d85528ee4edb9742cfb389

--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

