import { z } from 'zod';

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[@$!%*?&]/, 'Must contain at least one special character');

export const registerSchema = z
    .object({
        fullName: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Please enter a valid email'),
        password: passwordSchema,
        confirmPassword: z.string(),
        phoneNumber: z
            .string()
            .regex(/^\d{11}$/, 'Phone number must be exactly 11 digits and numbers only'),
        studentType: z.enum([
            'diploma_midwifery',
            'diploma_nursing_midwifery',
            'bsc_midwifery',
            'bsc_nursing_midwifery',
        ]),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
    .object({
        resetToken: z.string().min(1, 'Reset token is required'),
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z
        .string()
        .regex(/^\d{11}$/, 'Phone number must be exactly 11 digits and numbers only')
        .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
