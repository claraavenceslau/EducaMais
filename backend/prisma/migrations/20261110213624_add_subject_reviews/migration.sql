-- CreateTable
CREATE TABLE "subject_reviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subject_reviews_subject_id_idx" ON "subject_reviews"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_reviews_user_id_subject_id_key" ON "subject_reviews"("user_id", "subject_id");

-- AddForeignKey
ALTER TABLE "subject_reviews" ADD CONSTRAINT "subject_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_reviews" ADD CONSTRAINT "subject_reviews_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
