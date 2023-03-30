import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({ 
  timestamps: true, 
  toJSON: {
    transform: (doc: HydratedDocument<Todo>, ret) => {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
  }
  }, 
})
export class Todo {
  @Prop({ required: true })
  title: string;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);