trabalho-db2

```sql
CREATE TABLE public.aerodromos (
	code character(4) COLLATE pg_catalog."default" NOT NULL,
  	latitude double precision NOT NULL,
	longitude double precision NOT NULL,
	name character varying(200) COLLATE pg_catalog."default" NOT NULL,
	CONSTRAINT aerodromos_pkey PRIMARY KEY (code),
	CONSTRAINT latitude_pos CHECK (latitude <= 90::double precision),
	CONSTRAINT longitude_pos CHECK (longitude <= 180::double precision),
	CONSTRAINT latitude_neg CHECK (latitude >= '-90'::integer::double precision),
	CONSTRAINT longitude_neg CHECK (longitude >= '-180'::integer::double precision)
);

CREATE INDEX aerodromos_coordinates
	ON public.aerodromos USING btree
	(latitude ASC NULLS LAST, longitude ASC NULLS LAST);


CREATE TABLE public.metar(
	id SERIAL,
	code_aerodromo character(4) COLLATE pg_catalog."default" NOT NULL,
	date timestamp without time zone NOT NULL,
  	message text COLLATE pg_catalog."default" NOT NULL,
  	CONSTRAINT taf_pkey PRIMARY KEY (id),
  	CONSTRAINT code_message_metar UNIQUE (code_aerodromo, date),
  	CONSTRAINT code_aerodromo_metar FOREIGN KEY (code_aerodromo)
		REFERENCES public.aerodromos (code) MATCH FULL
		ON UPDATE CASCADE
		ON DELETE CASCADE
);

CREATE TABLE public.taf(
	id SERIAL,
	code_aerodromo character(4) COLLATE pg_catalog."default" NOT NULL,
	date timestamp without time zone NOT NULL,
  	message text COLLATE pg_catalog."default" NOT NULL,
	CONSTRAINT metar_pkey PRIMARY KEY (id),
  	CONSTRAINT code_message_taf UNIQUE (code_aerodromo, date),
  	CONSTRAINT code_aerodromo_taf FOREIGN KEY (code_aerodromo)
		REFERENCES public.aerodromos (code) MATCH FULL
		ON UPDATE CASCADE
		ON DELETE CASCADE
);

CREATE TABLE public.sigmet(
	id SERIAL PRIMARY KEY,
	validade_inicial timestamp without time zone NOT NULL,
	validade_final timestamp without time zone NOT NULL,
	message text COLLATE pg_catalog."default" NOT NULL,
	fenomeno text COLLATE pg_catalog."default" NOT NULL,
	fenomeno_comp text COLLATE pg_catalog."default" NOT NULL,
	fenomeno_cor text COLLATE pg_catalog."default" NOT NULL,
	fenomeno_transparencia text COLLATE pg_catalog."default" NOT NULL
);
```
