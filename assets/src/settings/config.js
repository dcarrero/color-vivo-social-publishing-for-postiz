/**
 * Data printed by src/Admin/SettingsPage.php.
 */
import { __ } from '@wordpress/i18n';

export const config = window.socialRelayCviAdmin || {};

export const MODES = [
	{
		value: 'now',
		label: __( 'Publish right away', 'color-vivo-social-publishing-for-postiz' ),
	},
	{
		value: 'schedule',
		label: __( 'Schedule with a delay', 'color-vivo-social-publishing-for-postiz' ),
	},
	{
		value: 'slot',
		label: __( 'Next free time in Postiz', 'color-vivo-social-publishing-for-postiz' ),
	},
	{
		value: 'draft',
		label: __( 'Create as draft in Postiz', 'color-vivo-social-publishing-for-postiz' ),
	},
];

export const IMAGE_MODES = [
	{
		value: 'featured',
		label: __( 'Featured image', 'color-vivo-social-publishing-for-postiz' ),
	},
	{
		value: 'content',
		label: __(
			'Featured image and images in the post',
			'color-vivo-social-publishing-for-postiz'
		),
	},
	{
		value: 'none',
		label: __( 'No images', 'color-vivo-social-publishing-for-postiz' ),
	},
];
