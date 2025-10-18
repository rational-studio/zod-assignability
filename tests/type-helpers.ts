import z from 'zod';
export type Extends<A, B> = [z.infer<A>] extends [z.infer<B>] ? true : false;
