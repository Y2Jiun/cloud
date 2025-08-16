"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";

const schema = zod.object({
	otp: zod.string().min(6, { message: "OTP must be 6 digits" }).max(6, { message: "OTP must be 6 digits" }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { otp: "" } satisfies Values;

export function VerifyOtpForm(): React.JSX.Element {
	const router = useRouter();
	const [isPending, setIsPending] = React.useState<boolean>(false);
	const [isResending, setIsResending] = React.useState<boolean>(false);
	const [timeLeft, setTimeLeft] = React.useState<number>(60); // 1 minute countdown
	const [email, setEmail] = React.useState<string>("");

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

	// Get email from sessionStorage and start countdown
	React.useEffect(() => {
		const storedEmail = sessionStorage.getItem("reset-email");
		if (!storedEmail) {
			// If no email found, redirect back to reset password page
			router.push(paths.auth.resetPassword);
			return;
		}
		setEmail(storedEmail);

		// Start countdown timer
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [router]);

	const onSubmit = React.useCallback(
		async (values: Values): Promise<void> => {
			setIsPending(true);

			const { error, data } = await authClient.verifyOtp({
				email,
				otp: values.otp,
			});

			if (error) {
				setError("root", { type: "server", message: error });
				setIsPending(false);
				return;
			}

			setIsPending(false);

			// Store the reset token for the new password page
			if (data?.token) {
				sessionStorage.setItem("reset-token", data.token);
				// Redirect to new password page
				router.push(paths.auth.newPassword);
			}
		},
		[email, setError, router]
	);

	const handleResendOtp = React.useCallback(async () => {
		setIsResending(true);

		const { error } = await authClient.resetPassword({ email });

		if (error) {
			setError("root", { type: "server", message: error });
		} else {
			// Reset countdown
			setTimeLeft(60);
			setError("root", { type: "success", message: "New OTP sent successfully!" });
		}

		setIsResending(false);
	}, [email, setError]);

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Stack spacing={4}>
			<Stack spacing={1}>
				<Typography variant="h4">Verify OTP</Typography>
				<Typography color="text.secondary" variant="body2">
					We've sent a 6-digit verification code to <strong>{email}</strong>
				</Typography>
				<Typography color="text.secondary" variant="body2">
					Please enter the code below to continue with password reset.
				</Typography>
			</Stack>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={3}>
					<Controller
						control={control}
						name="otp"
						render={({ field }) => (
							<FormControl error={Boolean(errors.otp)}>
								<InputLabel>6-Digit OTP Code</InputLabel>
								<OutlinedInput
									{...field}
									label="6-Digit OTP Code"
									type="text"
									inputProps={{
										maxLength: 6,
										style: { textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" },
									}}
									placeholder="000000"
								/>
								{errors.otp ? <FormHelperText>{errors.otp.message}</FormHelperText> : null}
							</FormControl>
						)}
					/>

					{/* Countdown Timer */}
					<Box sx={{ textAlign: "center" }}>
						{timeLeft > 0 ? (
							<Typography variant="body2" color="text.secondary">
								Code expires in: <strong>{formatTime(timeLeft)}</strong>
							</Typography>
						) : (
							<Typography variant="body2" color="error">
								Code has expired. Please request a new one.
							</Typography>
						)}
					</Box>

					{errors.root ? (
						<Alert color={errors.root.type === "success" ? "success" : "error"}>
							{errors.root.message}
						</Alert>
					) : null}

					<Button disabled={isPending || timeLeft === 0} type="submit" variant="contained">
						{isPending ? "Verifying..." : "Verify OTP"}
					</Button>

					{/* Resend OTP */}
					<Box sx={{ textAlign: "center" }}>
						<Typography variant="body2" color="text.secondary">
							Didn't receive the code?{" "}
							<Link
								component="button"
								type="button"
								onClick={handleResendOtp}
								disabled={isResending || timeLeft > 0}
								underline="hover"
								variant="subtitle2"
							>
								{isResending ? "Sending..." : "Resend OTP"}
							</Link>
						</Typography>
					</Box>

					{/* Back to reset password */}
					<Box sx={{ textAlign: "center" }}>
						<Link
							component="button"
							type="button"
							onClick={() => router.push(paths.auth.resetPassword)}
							underline="hover"
							variant="body2"
						>
							← Back to Reset Password
						</Link>
					</Box>
				</Stack>
			</form>
		</Stack>
	);
}
