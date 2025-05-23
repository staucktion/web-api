-- CreateTable
CREATE TABLE "auction" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT,
    "status_id" INTEGER,
    "start_time" TIMESTAMP(6) NOT NULL,
    "finish_time" TIMESTAMP(6) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status_id" INTEGER,
    "address" VARCHAR(255) NOT NULL,
    "location_id" BIGINT,
    "valid_radius" DECIMAL(10,1) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" BIGSERIAL NOT NULL,
    "latitude" VARCHAR(100) NOT NULL,
    "longitude" VARCHAR(100) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" BIGSERIAL NOT NULL,
    "file_path" VARCHAR(100),
    "title" VARCHAR(100),
    "user_id" BIGINT,
    "auction_id" BIGINT,
    "location_id" BIGINT,
    "category_id" BIGINT,
    "status_id" INTEGER,
    "is_auctionable" BOOLEAN NOT NULL,
    "device_info" VARCHAR(255) NOT NULL,
    "vote_count" INTEGER NOT NULL,
    "purchase_now_price" DECIMAL(10,2),
    "purchased_at" TIMESTAMP(6),
    "is_deleted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status" (
    "id" SERIAL NOT NULL,
    "status" VARCHAR(100) NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "gmail_id" VARCHAR(100),
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "password" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "tc_identity_no" VARCHAR(11),
    "profile_picture" TEXT,
    "role_id" BIGINT,
    "status_id" INTEGER,
    "is_deleted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" BIGSERIAL NOT NULL,
    "role" VARCHAR(100) NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron" (
    "id" BIGSERIAL NOT NULL,
    "unit" CHAR(1) NOT NULL,
    "interval" INTEGER NOT NULL,
    "last_trigger_time" TIMESTAMP(6),
    "name" VARCHAR NOT NULL,
    "next_trigger_time" TIMESTAMP(6),

    CONSTRAINT "cron_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_photo" (
    "id" BIGSERIAL NOT NULL,
    "photo_id" BIGINT,
    "auction_id" BIGINT,
    "status_id" INTEGER NOT NULL,
    "last_bid_amount" DECIMAL(10,2),
    "start_time" TIMESTAMP(6) NOT NULL,
    "finish_time" TIMESTAMP(6) NOT NULL,
    "current_winner_order" INTEGER,
    "winner_user_id_1" BIGINT,
    "winner_user_id_2" BIGINT,
    "winner_user_id_3" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "auction_photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid" (
    "id" BIGSERIAL NOT NULL,
    "bid_amount" DECIMAL(10,2) NOT NULL,
    "user_id" BIGINT,
    "auction_photo_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote" (
    "id" BIGSERIAL NOT NULL,
    "auction_id" BIGINT,
    "user_id" BIGINT,
    "photo_id" BIGINT,
    "status_id" INTEGER,
    "transfer_amount" DECIMAL(10,2),

    CONSTRAINT "vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photographer_payment" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "status_id" INTEGER,
    "payment_amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "photographer_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchased_photo" (
    "id" BIGSERIAL NOT NULL,
    "photo_id" BIGINT,
    "user_id" BIGINT,
    "payment_amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "purchased_photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" BIGSERIAL NOT NULL,
    "sent_by_user_id" BIGINT NOT NULL,
    "sent_to_user_id" BIGINT NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "seen_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config" (
    "id" SERIAL NOT NULL,
    "voter_comission_percentage" DECIMAL(10,2) NOT NULL,
    "photographer_comission_percentage" DECIMAL(10,2) NOT NULL,
    "photos_to_auction_percentage" DECIMAL(10,2) NOT NULL,
    "is_timer_job_active" BOOLEAN NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_role_key" ON "user_role"("role");

-- CreateIndex
CREATE INDEX "notification_sent_to_user_id_seen_at_idx" ON "notification"("sent_to_user_id", "seen_at");

-- AddForeignKey
ALTER TABLE "auction" ADD CONSTRAINT "auction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auction" ADD CONSTRAINT "auction_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "user_role"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auction_photo" ADD CONSTRAINT "auction_photo_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auction_photo" ADD CONSTRAINT "auction_photo_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auction_photo" ADD CONSTRAINT "auction_photo_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auction_photo" ADD CONSTRAINT "auction_photo_winner_user_id_1_fkey" FOREIGN KEY ("winner_user_id_1") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auction_photo" ADD CONSTRAINT "auction_photo_winner_user_id_2_fkey" FOREIGN KEY ("winner_user_id_2") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auction_photo" ADD CONSTRAINT "auction_photo_winner_user_id_3_fkey" FOREIGN KEY ("winner_user_id_3") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bid" ADD CONSTRAINT "bid_auction_photo_id_fkey" FOREIGN KEY ("auction_photo_id") REFERENCES "auction_photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bid" ADD CONSTRAINT "bid_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photographer_payment" ADD CONSTRAINT "photographer_payment_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photographer_payment" ADD CONSTRAINT "photographer_payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchased_photo" ADD CONSTRAINT "purchased_photo_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchased_photo" ADD CONSTRAINT "purchased_photo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_sent_by_user_id_fkey" FOREIGN KEY ("sent_by_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_sent_to_user_id_fkey" FOREIGN KEY ("sent_to_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

