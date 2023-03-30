import { Todo } from './todo.interface';

export interface SearchTodo {
  hits: {
    total: number;
    hits: Array<{
      _source: Todo;
    }>;
  };
}
