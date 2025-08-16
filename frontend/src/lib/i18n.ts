import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Translation resources
const resources = {
	en: {
		translation: {
			// Navigation
			"nav.overview": "Overview",
			"nav.customers": "Customers",
			"nav.integrations": "Integrations",
			"nav.settings": "Settings",
			"nav.account": "Account",
			"nav.error": "Error",

			// Settings page
			"settings.title": "Settings",
			"settings.appearance": "Appearance",
			"settings.appearance.subtitle": "Customize the look and feel of your dashboard",
			"settings.theme": "Theme",
			"settings.theme.light": "Light",
			"settings.theme.dark": "Dark",
			"settings.fontSize": "Font Size",
			"settings.compactMode": "Compact Mode",
			"settings.compactMode.spacious": "Spacious",
			"settings.compactMode.compact": "Compact",

			// Notifications
			"settings.notifications": "Notifications",
			"settings.notifications.subtitle": "Manage your notification preferences",
			"settings.notifications.email": "Email Notifications",
			"settings.notifications.push": "Push Notifications",
			"settings.notifications.productUpdates": "Product updates and announcements",
			"settings.notifications.securityAlerts": "Security alerts",
			"settings.notifications.browserNotifications": "Browser notifications",

			// Language & Region
			"settings.language": "Language & Region",
			"settings.language.subtitle": "Set your language and regional preferences",
			"settings.language.label": "Language",

			// Auto-save
			"settings.autoSave": "Auto-save Settings",
			"settings.autoSave.subtitle": "Automatically save your preferences as you make changes",

			// Privacy
			"settings.privacy": "Privacy",
			"settings.privacy.subtitle": "Control your privacy and data sharing preferences",
			"settings.privacy.dataCollection": "Data Collection",
			"settings.privacy.analytics": "Allow analytics and usage data collection",
			"settings.privacy.cookies": "Accept non-essential cookies",

			// Actions
			"actions.save": "Save Changes",
			"actions.reset": "Reset to Defaults",
			"messages.settingsSaved": "Settings saved successfully!",
			"messages.settingsReset": "Settings reset to defaults!",
		},
	},
	es: {
		translation: {
			// Navigation
			"nav.overview": "Resumen",
			"nav.customers": "Clientes",
			"nav.integrations": "Integraciones",
			"nav.settings": "Configuración",
			"nav.account": "Cuenta",
			"nav.error": "Error",

			// Settings page
			"settings.title": "Configuración",
			"settings.appearance": "Apariencia",
			"settings.appearance.subtitle": "Personaliza el aspecto de tu panel de control",
			"settings.theme": "Tema",
			"settings.theme.light": "Claro",
			"settings.theme.dark": "Oscuro",
			"settings.fontSize": "Tamaño de Fuente",
			"settings.compactMode": "Modo Compacto",
			"settings.compactMode.spacious": "Espacioso",
			"settings.compactMode.compact": "Compacto",

			// Notifications
			"settings.notifications": "Notificaciones",
			"settings.notifications.subtitle": "Gestiona tus preferencias de notificación",
			"settings.notifications.email": "Notificaciones por Email",
			"settings.notifications.push": "Notificaciones Push",
			"settings.notifications.productUpdates": "Actualizaciones de productos y anuncios",
			"settings.notifications.securityAlerts": "Alertas de seguridad",
			"settings.notifications.browserNotifications": "Notificaciones del navegador",

			// Language & Region
			"settings.language": "Idioma y Región",
			"settings.language.subtitle": "Configura tu idioma y preferencias regionales",
			"settings.language.label": "Idioma",

			// Auto-save
			"settings.autoSave": "Guardado Automático",
			"settings.autoSave.subtitle": "Guarda automáticamente tus preferencias mientras realizas cambios",

			// Privacy
			"settings.privacy": "Privacidad",
			"settings.privacy.subtitle": "Controla tu privacidad y preferencias de compartir datos",
			"settings.privacy.dataCollection": "Recopilación de Datos",
			"settings.privacy.analytics": "Permitir recopilación de datos de análisis y uso",
			"settings.privacy.cookies": "Aceptar cookies no esenciales",

			// Actions
			"actions.save": "Guardar Cambios",
			"actions.reset": "Restablecer Valores Predeterminados",
			"messages.settingsSaved": "¡Configuración guardada exitosamente!",
			"messages.settingsReset": "¡Configuración restablecida a valores predeterminados!",
		},
	},
	fr: {
		translation: {
			// Navigation
			"nav.overview": "Aperçu",
			"nav.customers": "Clients",
			"nav.integrations": "Intégrations",
			"nav.settings": "Paramètres",
			"nav.account": "Compte",
			"nav.error": "Erreur",

			// Settings page
			"settings.title": "Paramètres",
			"settings.appearance": "Apparence",
			"settings.appearance.subtitle": "Personnalisez l'apparence de votre tableau de bord",
			"settings.theme": "Thème",
			"settings.theme.light": "Clair",
			"settings.theme.dark": "Sombre",
			"settings.fontSize": "Taille de Police",
			"settings.compactMode": "Mode Compact",
			"settings.compactMode.spacious": "Spacieux",
			"settings.compactMode.compact": "Compact",

			// Notifications
			"settings.notifications": "Notifications",
			"settings.notifications.subtitle": "Gérez vos préférences de notification",
			"settings.notifications.email": "Notifications Email",
			"settings.notifications.push": "Notifications Push",
			"settings.notifications.productUpdates": "Mises à jour de produits et annonces",
			"settings.notifications.securityAlerts": "Alertes de sécurité",
			"settings.notifications.browserNotifications": "Notifications du navigateur",

			// Language & Region
			"settings.language": "Langue et Région",
			"settings.language.subtitle": "Définissez votre langue et vos préférences régionales",
			"settings.language.label": "Langue",

			// Auto-save
			"settings.autoSave": "Sauvegarde Automatique",
			"settings.autoSave.subtitle": "Sauvegardez automatiquement vos préférences lors des modifications",

			// Privacy
			"settings.privacy": "Confidentialité",
			"settings.privacy.subtitle": "Contrôlez votre confidentialité et vos préférences de partage de données",
			"settings.privacy.dataCollection": "Collecte de Données",
			"settings.privacy.analytics": "Autoriser la collecte de données d'analyse et d'utilisation",
			"settings.privacy.cookies": "Accepter les cookies non essentiels",

			// Actions
			"actions.save": "Sauvegarder les Modifications",
			"actions.reset": "Rétablir les Valeurs par Défaut",
			"messages.settingsSaved": "Paramètres sauvegardés avec succès !",
			"messages.settingsReset": "Paramètres rétablis aux valeurs par défaut !",
		},
	},
	de: {
		translation: {
			// Navigation
			"nav.overview": "Übersicht",
			"nav.customers": "Kunden",
			"nav.integrations": "Integrationen",
			"nav.settings": "Einstellungen",
			"nav.account": "Konto",
			"nav.error": "Fehler",

			// Settings page
			"settings.title": "Einstellungen",
			"settings.appearance": "Erscheinungsbild",
			"settings.appearance.subtitle": "Passen Sie das Aussehen Ihres Dashboards an",
			"settings.theme": "Design",
			"settings.theme.light": "Hell",
			"settings.theme.dark": "Dunkel",
			"settings.fontSize": "Schriftgröße",
			"settings.compactMode": "Kompakter Modus",
			"settings.compactMode.spacious": "Geräumig",
			"settings.compactMode.compact": "Kompakt",

			// Notifications
			"settings.notifications": "Benachrichtigungen",
			"settings.notifications.subtitle": "Verwalten Sie Ihre Benachrichtigungseinstellungen",
			"settings.notifications.email": "E-Mail-Benachrichtigungen",
			"settings.notifications.push": "Push-Benachrichtigungen",
			"settings.notifications.productUpdates": "Produktupdates und Ankündigungen",
			"settings.notifications.securityAlerts": "Sicherheitswarnungen",
			"settings.notifications.browserNotifications": "Browser-Benachrichtigungen",

			// Language & Region
			"settings.language": "Sprache & Region",
			"settings.language.subtitle": "Stellen Sie Ihre Sprach- und Regionaleinstellungen ein",
			"settings.language.label": "Sprache",

			// Auto-save
			"settings.autoSave": "Automatisches Speichern",
			"settings.autoSave.subtitle": "Speichern Sie Ihre Einstellungen automatisch bei Änderungen",

			// Privacy
			"settings.privacy": "Datenschutz",
			"settings.privacy.subtitle": "Kontrollieren Sie Ihre Datenschutz- und Datenfreigabeeinstellungen",
			"settings.privacy.dataCollection": "Datensammlung",
			"settings.privacy.analytics": "Analyse- und Nutzungsdatensammlung zulassen",
			"settings.privacy.cookies": "Nicht-essentielle Cookies akzeptieren",

			// Actions
			"actions.save": "Änderungen Speichern",
			"actions.reset": "Auf Standard Zurücksetzen",
			"messages.settingsSaved": "Einstellungen erfolgreich gespeichert!",
			"messages.settingsReset": "Einstellungen auf Standard zurückgesetzt!",
		},
	},
	zh: {
		translation: {
			// Navigation
			"nav.overview": "概览",
			"nav.customers": "客户",
			"nav.integrations": "集成",
			"nav.settings": "设置",
			"nav.account": "账户",
			"nav.error": "错误",

			// Settings page
			"settings.title": "设置",
			"settings.appearance": "外观",
			"settings.appearance.subtitle": "自定义您的仪表板外观",
			"settings.theme": "主题",
			"settings.theme.light": "浅色",
			"settings.theme.dark": "深色",
			"settings.fontSize": "字体大小",
			"settings.compactMode": "紧凑模式",
			"settings.compactMode.spacious": "宽松",
			"settings.compactMode.compact": "紧凑",

			// Notifications
			"settings.notifications": "通知",
			"settings.notifications.subtitle": "管理您的通知偏好",
			"settings.notifications.email": "邮件通知",
			"settings.notifications.push": "推送通知",
			"settings.notifications.productUpdates": "产品更新和公告",
			"settings.notifications.securityAlerts": "安全警报",
			"settings.notifications.browserNotifications": "浏览器通知",

			// Language & Region
			"settings.language": "语言和地区",
			"settings.language.subtitle": "设置您的语言和地区偏好",
			"settings.language.label": "语言",

			// Auto-save
			"settings.autoSave": "自动保存",
			"settings.autoSave.subtitle": "在您进行更改时自动保存您的偏好",

			// Privacy
			"settings.privacy": "隐私",
			"settings.privacy.subtitle": "控制您的隐私和数据共享偏好",
			"settings.privacy.dataCollection": "数据收集",
			"settings.privacy.analytics": "允许分析和使用数据收集",
			"settings.privacy.cookies": "接受非必要的cookies",

			// Actions
			"actions.save": "保存更改",
			"actions.reset": "重置为默认值",
			"messages.settingsSaved": "设置保存成功！",
			"messages.settingsReset": "设置已重置为默认值！",
		},
	},
	ja: {
		translation: {
			// Navigation
			"nav.overview": "概要",
			"nav.customers": "顧客",
			"nav.integrations": "統合",
			"nav.settings": "設定",
			"nav.account": "アカウント",
			"nav.error": "エラー",

			// Settings page
			"settings.title": "設定",
			"settings.appearance": "外観",
			"settings.appearance.subtitle": "ダッシュボードの外観をカスタマイズ",
			"settings.theme": "テーマ",
			"settings.theme.light": "ライト",
			"settings.theme.dark": "ダーク",
			"settings.fontSize": "フォントサイズ",
			"settings.compactMode": "コンパクトモード",
			"settings.compactMode.spacious": "ゆったり",
			"settings.compactMode.compact": "コンパクト",

			// Notifications
			"settings.notifications": "通知",
			"settings.notifications.subtitle": "通知設定を管理",
			"settings.notifications.email": "メール通知",
			"settings.notifications.push": "プッシュ通知",
			"settings.notifications.productUpdates": "製品アップデートとお知らせ",
			"settings.notifications.securityAlerts": "セキュリティアラート",
			"settings.notifications.browserNotifications": "ブラウザ通知",

			// Language & Region
			"settings.language": "言語と地域",
			"settings.language.subtitle": "言語と地域の設定を行う",
			"settings.language.label": "言語",

			// Auto-save
			"settings.autoSave": "自動保存",
			"settings.autoSave.subtitle": "変更時に設定を自動保存",

			// Privacy
			"settings.privacy": "プライバシー",
			"settings.privacy.subtitle": "プライバシーとデータ共有の設定を管理",
			"settings.privacy.dataCollection": "データ収集",
			"settings.privacy.analytics": "分析と使用データの収集を許可",
			"settings.privacy.cookies": "必須でないクッキーを受け入れる",

			// Actions
			"actions.save": "変更を保存",
			"actions.reset": "デフォルトにリセット",
			"messages.settingsSaved": "設定が正常に保存されました！",
			"messages.settingsReset": "設定がデフォルトにリセットされました！",
		},
	},
};

i18n.use(initReactI18next).init({
	resources,
	lng: "en", // default language
	fallbackLng: "en",

	interpolation: {
		escapeValue: false, // React already escapes values
	},

	react: {
		useSuspense: false, // Disable suspense for SSR compatibility
	},
});

export default i18n;
