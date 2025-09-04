import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { ClipboardIcon } from "@phosphor-icons/react/dist/ssr/Clipboard";
import { ListChecks as ListIcon } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { PlugsConnectedIcon } from "@phosphor-icons/react/dist/ssr/PlugsConnected";
import { Question } from "@phosphor-icons/react/dist/ssr/Question";
import { ScalesIcon } from "@phosphor-icons/react/dist/ssr/Scales";
import { UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning";

export const navIcons = {
	"chart-pie": ChartPieIcon,
	"plugs-connected": PlugsConnectedIcon,
	user: UserIcon,
	users: UsersIcon,
	// Scam Reporting System Icons
	warning: WarningIcon,
	bell: BellIcon,
	scales: ScalesIcon,
	// Admin Management Icons
	question: Question,
	list: ListIcon,
	// Questionnaire Management Icons
	clipboard: ClipboardIcon,
} as Record<string, Icon>;
