'use strict';

import deepFreeze from 'deep-freeze-strict';
import { push } from './methods';


// Flowtype
type OBJECT = { [key: string]: any };
type OPTIONS = {
  type: ?string,
  methods: ?OBJECT,
  schema: ?OBJECT,
  middleware: ?Array<any>
};
declare function FROZEN_OBJECT(key: string, value: any): OBJECT;
declare function FN_LIST(data: Array<any>): LIST;
declare function MIDDLEWARE(data: any): bool;


export function pipeMiddleware (middleware: Array<any>): FN_LIST {
  return function (data: Array<any>): Array<any> {

    const reducer = (value: any, fn: MIDDLEWARE): any => {
      if (Array.isArray(value)) {
        return value.map((el: any) => fn(el));
      } else {
        return fn(value);
      }
    };

    const pipe = (fns: Array<any>) => (current: any) => fns.reduce(reducer, current);

    return pipe(middleware)(data);
  };
}


// Number List methods
export function numberMethods (list: Array<any>, options: OPTIONS): OBJECT {
  return options.type === 'number' ? {
    decrease: (i: number) => createStructure(push(list.length + (-i || -1))(list), options),
    increment: (i: number) => createStructure(push(list.length + (i || 1))(list), options)
  } : {};
};


export function transformData (data: Array<any>, middleware: Array<any>): Array<any> {
  return middleware ? pipeMiddleware(middleware)(data) : data;
}

// Creates a new List
export function createStructure (data: Array<any>, options: OPTIONS): FROZEN_OBJECT {
  const { type, middleware, methods, schema, size } = options;

  // return new List
  return deepFreeze(Object.assign(
    {},
    {
      data      : data,
      size      : data.length,
      type      : type,
      maxSize   : size,
      schema    : schema,
      ...numberMethods(transformData(data, middleware), options),
      ...methods
    }
  ));
};
