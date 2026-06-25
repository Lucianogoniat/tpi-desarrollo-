export declare class RegisterInput {
    email: string;
    password: string;
}
export declare class LoginInput extends RegisterInput {
}
export declare class VerifyEmailInput {
    token: string;
}
export declare class ForgotPasswordInput {
    email: string;
}
export declare class ResetPasswordInput extends VerifyEmailInput {
    password: string;
}
