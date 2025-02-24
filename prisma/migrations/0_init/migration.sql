-- CreateTable
CREATE TABLE "auction"(
    "id" bigserial NOT NULL,
    "category_id" bigint NOT NULL,
    "status_id" integer NOT NULL,
    "start_time" timestamp(6) NOT NULL,
    "finish_time" timestamp(6) NOT NULL,
    "is_deleted" boolean NOT NULL,
    "created_at" timestamp(6) NOT NULL,
    "updated_at" timestamp(6) NOT NULL,
    CONSTRAINT "auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid"(
    "id" bigserial NOT NULL,
    "auction_id" bigint,
    "user_id" bigint,
    "amount" DECIMAL(15, 2) NOT NULL,
    "provision_id_on_bank" bigint,
    CONSTRAINT "bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category"(
    "id" bigserial NOT NULL,
    "name" varchar(100) NOT NULL,
    "status_id" integer NOT NULL,
    "address" varchar(255) NOT NULL,
    "location_id" bigint NOT NULL,
    "valid_radius" DECIMAL(10, 1) NOT NULL,
    "is_deleted" boolean NOT NULL,
    "created_at" timestamp(6) NOT NULL,
    "updated_at" timestamp(6) NOT NULL,
    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location"(
    "id" bigserial NOT NULL,
    "latitude" varchar(100) NOT NULL,
    "longitude" varchar(100) NOT NULL,
    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo"(
    "id" bigserial NOT NULL,
    "file_path" varchar(100),
    "title" varchar(100),
    "user_id" bigserial NOT NULL,
    "auction_id" bigint,
    "location_id" bigserial NOT NULL,
    "category_id" bigserial NOT NULL,
    "status_id" integer NOT NULL,
    "device_info" varchar(255) NOT NULL,
    "vote_count" integer NOT NULL,
    "is_deleted" boolean NOT NULL,
    "created_at" timestamp(6) NOT NULL,
    "updated_at" timestamp(6) NOT NULL,
    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status"(
    "id" serial NOT NULL,
    "status" varchar(100) NOT NULL,
    CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user"(
    "id" bigserial NOT NULL,
    "username" varchar(100) NOT NULL,
    "email" varchar(100) NOT NULL,
    "password" varchar(255) NOT NULL,
    "first_name" varchar(100) NOT NULL,
    "last_name" varchar(100) NOT NULL,
    "role_id" bigserial,
    "status_id" integer,
    "is_deleted" boolean NOT NULL,
    "created_at" timestamp(6) NOT NULL,
    "updated_at" timestamp(6) NOT NULL,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role"(
    "id" bigserial NOT NULL,
    "role" varchar(100) NOT NULL,
    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bid_provision_id_on_bank_key" ON "bid"("provision_id_on_bank");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_role_key" ON "user_role"("role");

-- AddForeignKey
ALTER TABLE "auction"
    ADD CONSTRAINT "auction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auction"
    ADD CONSTRAINT "auction_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bid"
    ADD CONSTRAINT "bid_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bid"
    ADD CONSTRAINT "bid_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category"
    ADD CONSTRAINT "category_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category"
    ADD CONSTRAINT "category_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo"
    ADD CONSTRAINT "photo_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo"
    ADD CONSTRAINT "photo_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo"
    ADD CONSTRAINT "photo_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo"
    ADD CONSTRAINT "photo_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo"
    ADD CONSTRAINT "photo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user"
    ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "user_role"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user"
    ADD CONSTRAINT "user_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

