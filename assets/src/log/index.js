/**
 * Color Vivo Social Publishing for Postiz: log screen.
 *
 * Built with the components WordPress already loads (no extra libraries), so the
 * bundle stays small. Data comes from socialrelaycvi/v1/admin/log.
 */
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Notice,
	SearchControl,
	SelectControl,
	Spinner,
	__experimentalConfirmDialog as ConfirmDialog, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { dateI18n, getSettings } from '@wordpress/date';
import {
	createRoot,
	useCallback,
	useEffect,
	useState,
} from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs, getQueryArg } from '@wordpress/url';

import { ChannelLabel } from '../common/ChannelAvatar';
import './style.css';

const config = window.socialRelayCviAdmin || {};
const channels = config.channels || {};
const PER_PAGE = 25;

const LEVELS = [
	{ value: '', label: __( 'All levels', 'color-vivo-social-publishing-for-postiz' ) },
	{ value: 'info', label: __( 'Info', 'color-vivo-social-publishing-for-postiz' ) },
	{ value: 'error', label: __( 'Error', 'color-vivo-social-publishing-for-postiz' ) },
];

/**
 * Readable name of a log action.
 *
 * @param {string} action Action key.
 * @return {string} Label.
 */
function actionLabel( action ) {
	const labels = {
		share: __( 'Share', 'color-vivo-social-publishing-for-postiz' ),
		cancel: __( 'Cancel', 'color-vivo-social-publishing-for-postiz' ),
		sync: __( 'Status sync', 'color-vivo-social-publishing-for-postiz' ),
		test: __( 'Connection test', 'color-vivo-social-publishing-for-postiz' ),
		upload: __( 'Image upload', 'color-vivo-social-publishing-for-postiz' ),
		webhook: __( 'Webhook', 'color-vivo-social-publishing-for-postiz' ),
	};
	return labels[ action ] || action;
}

function levelLabel( level ) {
	return LEVELS.find( ( item ) => item.value === level )?.label ?? level;
}

function Row( { item } ) {
	return (
		<tr>
			<td className="column-date">
				{ dateI18n(
					getSettings().formats.datetimeAbbreviated,
					item.created_at
				) }
			</td>
			<td>
				<span
					className={ `socialrelaycvi-log__level is-${ item.level }` }
				>
					{ levelLabel( item.level ) }
				</span>
			</td>
			<td>{ actionLabel( item.action ) }</td>
			<td>
				{ item.edit_link && (
					<a href={ item.edit_link }>
						{ item.post_title ||
							__( '(no title)', 'color-vivo-social-publishing-for-postiz' ) }
					</a>
				) }
			</td>
			<td>
				{ channels[ item.integration_id ] && (
					<ChannelLabel channel={ channels[ item.integration_id ] } />
				) }
				{ item.integration_id && ! channels[ item.integration_id ] && (
					<span
						className="socialrelaycvi-log__gone"
						title={ item.integration_id }
					>
						{ __(
							'Channel not in Postiz',
							'color-vivo-social-publishing-for-postiz'
						) }
					</span>
				) }
			</td>
			<td className="socialrelaycvi-log__message">{ item.message }</td>
		</tr>
	);
}

function LogApp() {
	const [ page, setPage ] = useState( 1 );
	// ?level=error comes from the "Log" button of the failure notice.
	const [ level, setLevel ] = useState(
		() => getQueryArg( window.location.href, 'level' ) || ''
	);
	const [ search, setSearch ] = useState( '' );
	const [ query, setQuery ] = useState( '' );
	const [ data, setData ] = useState( { items: [], total: 0, pages: 0 } );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( '' );
	const [ cleared, setCleared ] = useState( false );
	const [ confirming, setConfirming ] = useState( false );
	const [ stats, setStats ] = useState( null );

	const applySearch = useDebounce( ( value ) => {
		setQuery( value );
		setPage( 1 );
	}, 400 );

	const load = useCallback( () => {
		setLoading( true );
		apiFetch( {
			path: addQueryArgs( `/${ config.namespace }/admin/log`, {
				page,
				per_page: PER_PAGE,
				search: query,
				level,
			} ),
		} )
			.then( ( response ) => {
				setData( response );
				setError( '' );
			} )
			.catch( ( err ) => setError( err.message || String( err ) ) )
			.finally( () => setLoading( false ) );
	}, [ page, query, level ] );

	useEffect( load, [ load ] );

	const loadStats = useCallback( () => {
		apiFetch( { path: `/${ config.namespace }/admin/stats` } )
			.then( setStats )
			.catch( () => setStats( null ) );
	}, [] );

	useEffect( loadStats, [ loadStats ] );

	const refresh = () => {
		load();
		loadStats();
	};

	const clear = () => {
		setConfirming( false );
		apiFetch( {
			path: `/${ config.namespace }/admin/log`,
			method: 'DELETE',
		} )
			.then( () => {
				setCleared( true );
				return page === 1 ? load() : setPage( 1 );
			} )
			.catch( ( err ) => setError( err.message || String( err ) ) );
	};

	const columns = [
		__( 'Date', 'color-vivo-social-publishing-for-postiz' ),
		__( 'Level', 'color-vivo-social-publishing-for-postiz' ),
		__( 'Action', 'color-vivo-social-publishing-for-postiz' ),
		__( 'Post', 'color-vivo-social-publishing-for-postiz' ),
		__( 'Channel', 'color-vivo-social-publishing-for-postiz' ),
		__( 'Message', 'color-vivo-social-publishing-for-postiz' ),
	];

	return (
		<div className="socialrelaycvi-log">
			<div className="socialrelaycvi-log__header">
				<h1>{ __( 'Log', 'color-vivo-social-publishing-for-postiz' ) }</h1>
				<div className="socialrelaycvi-log__actions">
					<Button variant="secondary" onClick={ refresh }>
						{ __( 'Refresh', 'color-vivo-social-publishing-for-postiz' ) }
					</Button>
					<Button
						variant="tertiary"
						isDestructive
						onClick={ () => setConfirming( true ) }
						disabled={ ! data.total }
					>
						{ __( 'Clear log', 'color-vivo-social-publishing-for-postiz' ) }
					</Button>
				</div>
			</div>

			{ stats && (
				<div className="socialrelaycvi-log__stats">
					{ [
						[
							stats.published,
							__(
								'Published (30 days)',
								'color-vivo-social-publishing-for-postiz'
							),
							'is-success',
						],
						[
							stats.queued,
							__( 'Queued', 'color-vivo-social-publishing-for-postiz' ),
							'is-info',
						],
						[
							stats.errors,
							__( 'Errors (30 days)', 'color-vivo-social-publishing-for-postiz' ),
							'is-error',
						],
						[
							`${ stats.lastHour } / ${ stats.limit || 90 }`,
							__(
								'Requests to Postiz in the last hour (it allows 90)',
								'color-vivo-social-publishing-for-postiz'
							),
							'',
						],
					].map( ( [ value, label, tone ] ) => (
						<div
							key={ label }
							className={ `socialrelaycvi-log__stat ${ tone }` }
						>
							<strong>{ value }</strong>
							<span>{ label }</span>
						</div>
					) ) }
				</div>
			) }

			<div className="socialrelaycvi-log__filters">
				<SearchControl
					label={ __( 'Search messages', 'color-vivo-social-publishing-for-postiz' ) }
					value={ search }
					onChange={ ( value ) => {
						setSearch( value );
						applySearch( value );
					} }
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Level', 'color-vivo-social-publishing-for-postiz' ) }
					hideLabelFromVision
					value={ level }
					options={ LEVELS }
					onChange={ ( value ) => {
						setLevel( value );
						setPage( 1 );
					} }
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
				{ loading && <Spinner /> }
			</div>

			{ cleared && (
				<Notice status="success" onRemove={ () => setCleared( false ) }>
					{ __( 'Log cleared.', 'color-vivo-social-publishing-for-postiz' ) }
				</Notice>
			) }
			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }

			<table className="widefat striped socialrelaycvi-log__table">
				<thead>
					<tr>
						{ columns.map( ( column ) => (
							<th key={ column } scope="col">
								{ column }
							</th>
						) ) }
					</tr>
				</thead>
				<tbody>
					{ ! loading && ! data.items.length && (
						<tr>
							<td colSpan={ columns.length }>
								{ query || level
									? __(
											'No entries match the search or filter.',
											'color-vivo-social-publishing-for-postiz'
									  )
									: __(
											'Nothing logged yet.',
											'color-vivo-social-publishing-for-postiz'
									  ) }
							</td>
						</tr>
					) }
					{ data.items.map( ( item ) => (
						<Row key={ item.id } item={ item } />
					) ) }
				</tbody>
			</table>

			{ data.pages > 1 && (
				<div className="socialrelaycvi-log__pagination">
					<Button
						variant="secondary"
						disabled={ page <= 1 }
						onClick={ () => setPage( page - 1 ) }
					>
						{ __( 'Previous', 'color-vivo-social-publishing-for-postiz' ) }
					</Button>
					<span>
						{ sprintf(
							/* translators: 1: current page, 2: total pages, 3: total entries. */
							__(
								'Page %1$d of %2$d (%3$d entries)',
								'color-vivo-social-publishing-for-postiz'
							),
							page,
							data.pages,
							data.total
						) }
					</span>
					<Button
						variant="secondary"
						disabled={ page >= data.pages }
						onClick={ () => setPage( page + 1 ) }
					>
						{ __( 'Next', 'color-vivo-social-publishing-for-postiz' ) }
					</Button>
				</div>
			) }

			<ConfirmDialog
				isOpen={ confirming }
				onConfirm={ clear }
				onCancel={ () => setConfirming( false ) }
				confirmButtonText={ __(
					'Clear log',
					'color-vivo-social-publishing-for-postiz'
				) }
			>
				{ __(
					'Delete every log entry? This cannot be undone.',
					'color-vivo-social-publishing-for-postiz'
				) }
			</ConfirmDialog>
		</div>
	);
}

const root = document.getElementById( 'socialrelaycvi-log' );
if ( root ) {
	createRoot( root ).render( <LogApp /> );
}
