import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import './tag-menu.css';

/**
 * Template tags, grouped, with what each one gives.
 *
 * @return {Array<{label: string, tags: Array<[string, string]>}>} Groups of [tag, description].
 */
function groups() {
	return [
		{
			label: __( 'Post', 'color-vivo-social-publishing-for-postiz' ),
			tags: [
				[ '{title}', __( 'Title', 'color-vivo-social-publishing-for-postiz' ) ],
				[
					'{excerpt|limit:180}',
					__(
						'Excerpt, up to 180 characters',
						'color-vivo-social-publishing-for-postiz'
					),
				],
				[
					'{content|words:40}',
					__(
						'First 40 words of the content',
						'color-vivo-social-publishing-for-postiz'
					),
				],
				[
					'{url}',
					__( 'Link to the post', 'color-vivo-social-publishing-for-postiz' ),
				],
				[
					'{shortlink}',
					__( 'Short link', 'color-vivo-social-publishing-for-postiz' ),
				],
				[ '{author}', __( 'Author', 'color-vivo-social-publishing-for-postiz' ) ],
				[ '{date}', __( 'Date', 'color-vivo-social-publishing-for-postiz' ) ],
				[
					'{reading_time}',
					__( 'Minutes to read', 'color-vivo-social-publishing-for-postiz' ),
				],
			],
		},
		{
			label: __( 'Categories and tags', 'color-vivo-social-publishing-for-postiz' ),
			tags: [
				[
					'{first_category}',
					__(
						'Main category (Yoast or Rank Math) or the first one',
						'color-vivo-social-publishing-for-postiz'
					),
				],
				[
					'{categories}',
					__( 'All categories', 'color-vivo-social-publishing-for-postiz' ),
				],
				[
					'{hashtags:post_tag}',
					__( 'Tags as #hashtags', 'color-vivo-social-publishing-for-postiz' ),
				],
				[
					'{categories|hashtag}',
					__( 'Categories as #hashtags', 'color-vivo-social-publishing-for-postiz' ),
				],
			],
		},
		{
			label: __( 'Site and SEO', 'color-vivo-social-publishing-for-postiz' ),
			tags: [
				[ '{site_name}', __( 'Site name', 'color-vivo-social-publishing-for-postiz' ) ],
				[
					'{seo_title}',
					__( 'SEO title, or the title', 'color-vivo-social-publishing-for-postiz' ),
				],
				[
					'{seo_description}',
					__(
						'Meta description, or the excerpt',
						'color-vivo-social-publishing-for-postiz'
					),
				],
			],
		},
		{
			label: __( 'Threads', 'color-vivo-social-publishing-for-postiz' ),
			tags: [
				[
					'\n---\n',
					__( 'New part of the thread', 'color-vivo-social-publishing-for-postiz' ),
				],
			],
		},
	];
}

/**
 * Inserts text at the cursor of a textarea and puts the cursor after it.
 *
 * @param {Object}   ref      Ref to the textarea.
 * @param {string}   value    Current text.
 * @param {string}   text     Text to insert.
 * @param {Function} onChange Change handler.
 */
export function insertAtCursor( ref, value, text, onChange ) {
	const field = ref.current;
	const start = field ? field.selectionStart : value.length;
	const end = field ? field.selectionEnd : value.length;
	onChange( value.slice( 0, start ) + text + value.slice( end ) );
	window.requestAnimationFrame( () => {
		if ( field ) {
			field.focus();
			field.selectionStart = field.selectionEnd = start + text.length;
		}
	} );
}

/**
 * "Insert tag" menu: each entry shows the tag and what it gives.
 *
 * @param {Object}   props          Props.
 * @param {Function} props.onInsert Receives the tag text.
 * @return {Element} Menu.
 */
export default function TagMenu( { onInsert } ) {
	return (
		<DropdownMenu
			icon="editor-code"
			text={ __( 'Insert tag', 'color-vivo-social-publishing-for-postiz' ) }
			label={ __( 'Insert tag', 'color-vivo-social-publishing-for-postiz' ) }
			toggleProps={ { variant: 'secondary', size: 'compact' } }
			popoverProps={ { className: 'socialrelaycvi-tag-menu' } }
		>
			{ ( { onClose } ) =>
				groups().map( ( group ) => (
					<MenuGroup key={ group.label } label={ group.label }>
						{ group.tags.map( ( [ tag, description ] ) => (
							<MenuItem
								key={ tag }
								info={ description }
								onClick={ () => {
									onInsert( tag );
									onClose();
								} }
							>
								<code>{ tag.trim() }</code>
							</MenuItem>
						) ) }
					</MenuGroup>
				) )
			}
		</DropdownMenu>
	);
}
