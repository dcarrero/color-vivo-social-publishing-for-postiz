<?php
/**
 * Translated names of share statuses.
 *
 * @package SocialRelayCvi
 */

declare( strict_types=1 );

namespace SocialRelayCvi\Admin;

/**
 * Labels shared by the metabox, the dashboard widget and the log.
 */
final class StatusLabels {

	/**
	 * Label for a status.
	 *
	 * @param string $status queued, published, error, draft, cancelled.
	 */
	public static function label( string $status ): string {
		return match ( $status ) {
			'queued'    => __( 'Queued', 'color-vivo-social-publishing-for-postiz' ),
			'published' => __( 'Published', 'color-vivo-social-publishing-for-postiz' ),
			'error'     => __( 'Error', 'color-vivo-social-publishing-for-postiz' ),
			'draft'     => __( 'Draft in Postiz', 'color-vivo-social-publishing-for-postiz' ),
			'cancelled' => __( 'Cancelled', 'color-vivo-social-publishing-for-postiz' ),
			default     => $status,
		};
	}
}
