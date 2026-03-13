--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "address_line1" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "address_line2" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "unq_cart_product" UNIQUE("cart_id","product_id");--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "unq_cart_user" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "unq_wishlist_product" UNIQUE("wishlist_id","product_id");--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "unq_wishlist_user" UNIQUE("user_id");