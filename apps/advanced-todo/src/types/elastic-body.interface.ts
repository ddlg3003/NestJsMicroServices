import { TodoDoc } from "./todo.interface";

export interface ElasticBody {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number; 
      relation: string;
    };
    max_score: number;
    hits: {
      _source: TodoDoc;
    }[];
  };
}
