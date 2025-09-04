"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";

import { useNotifications } from "@/hooks/use-notifications";
import { usePopover } from "@/hooks/use-popover";
import { useUser } from "@/hooks/use-user";

import { MobileNav } from "./mobile-nav";
import { NotificationPopover } from "./notification-popover";
import { UserPopover } from "./user-popover";

export function MainNav(): React.JSX.Element {
	const [openNav, setOpenNav] = React.useState<boolean>(false);
	const { user } = useUser();
	const router = useRouter();

	const userPopover = usePopover<HTMLDivElement>();
	const notificationPopover = usePopover<HTMLDivElement>();
	const { notifications } = useNotifications();

	return (
		<React.Fragment>
			<Box
				component="header"
				sx={{
					borderBottom: "1px solid var(--mui-palette-divider)",
					backgroundColor: "var(--mui-palette-background-paper)",
					position: "sticky",
					top: 0,
					zIndex: "var(--mui-zIndex-appBar)",
				}}
			>
				<Stack
					direction="row"
					spacing={2}
					sx={{ alignItems: "center", justifyContent: "space-between", minHeight: "64px", px: 2 }}
				>
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						<IconButton
							onClick={(): void => {
								setOpenNav(true);
							}}
							sx={{ display: { lg: "none" } }}
						>
							<ListIcon />
						</IconButton>
						<Tooltip title="Search">
							<IconButton>
								<MagnifyingGlassIcon />
							</IconButton>
						</Tooltip>
					</Stack>
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						<Tooltip title="Contacts">
							<IconButton>
								<UsersIcon />
							</IconButton>
						</Tooltip>
						{user?.roles === 1 ? (
							// Admin: Link to notification management page
							<Tooltip title="Notification Management">
								<IconButton onClick={() => router.push("/dashboard/notifications")}>
									<BellIcon />
								</IconButton>
							</Tooltip>
						) : (
							// Users & Legal Officers: Show notification popover
							<Tooltip title="Notifications">
								<Badge badgeContent={notifications.length} color="success" variant="dot">
									<IconButton onClick={notificationPopover.handleOpen}>
										<BellIcon />
									</IconButton>
								</Badge>
							</Tooltip>
						)}
						<Avatar
							onClick={userPopover.handleOpen}
							ref={userPopover.anchorRef}
							src={user?.avatar || "/assets/avatar.png"}
							sx={{ cursor: "pointer" }}
						/>
					</Stack>
				</Stack>
			</Box>
			<UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
			{user?.roles !== 1 && (
				<NotificationPopover
					anchorEl={notificationPopover.anchorRef.current}
					onClose={notificationPopover.handleClose}
					open={notificationPopover.open}
				/>
			)}
			<MobileNav
				onClose={() => {
					setOpenNav(false);
				}}
				open={openNav}
			/>
		</React.Fragment>
	);
}
