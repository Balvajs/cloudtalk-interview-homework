CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"price" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quantity_positive" CHECK ("products"."quantity" >= 0),
	CONSTRAINT "price_positive" CHECK ("products"."price" >= 0)
);
