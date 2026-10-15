import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img?: string;
  discount?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  guestEmail?: string;
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode?: string;
  status: "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    img: { type: String, default: "" },
    discount: { type: String, default: "" },
  },
  { _id: false },
);

const OrderSchema: Schema<IOrder> = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    guestEmail: { type: String, lowercase: true, trim: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: "" },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  },
  { timestamps: true },
);

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
