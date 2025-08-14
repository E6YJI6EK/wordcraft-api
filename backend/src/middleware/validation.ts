import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        file: req.file,
        files: req.files
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({
          success: false,
          message: 'Ошибка валидации данных',
          errors
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
      return;
    }
  };
};

export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({
          success: false,
          message: 'Ошибка валидации данных',
          errors
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
      return;
    }
  };
};

export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({
          success: false,
          message: 'Ошибка валидации параметров запроса',
          errors
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
      return;
    }
  };
};

export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({
          success: false,
          message: 'Ошибка валидации параметров',
          errors
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
      return;
    }
  };
}; 