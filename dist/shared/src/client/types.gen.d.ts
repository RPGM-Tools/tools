export type GetData = {
    body?: never;
    path?: never;
    query?: never;
    url: '';
};
export type GetResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiAuthByAllData = {
    body?: never;
    path: {
        all: string;
    };
    query?: never;
    url: '/api/auth/{all}';
};
export type GetApiAuthByAllResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type PostApiDiscordInteractionsData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/discord/interactions';
};
export type PostApiDiscordInteractionsResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type PostApiForgeChatCompletionsData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/forge/chat/completions';
};
export type PostApiForgeChatCompletionsResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiForgeUsageData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/forge/usage';
};
export type GetApiForgeUsageResponses = {
    /**
     * The usage
     */
    200: number;
};
export type GetApiForgeUsageResponse = GetApiForgeUsageResponses[keyof GetApiForgeUsageResponses];
export type GetApiListProductsData = {
    body?: never;
    path?: never;
    query?: {
        'skip-cache'?: boolean;
    };
    url: '/api/list-products';
};
export type GetApiListProductsResponses = {
    /**
     * Get a list of all products available for purchase
     */
    200: Array<{
        id: string;
        name: string;
        description: string | null;
        prices: {
            [key: string]: unknown;
        };
        isRecurring?: boolean;
        medias: Array<{
            size?: number;
            publicUrl?: string;
        }>;
        metadata: {
            [key: string]: unknown;
        };
        slug: string;
    }>;
};
export type GetApiListProductsResponse = GetApiListProductsResponses[keyof GetApiListProductsResponses];
export type GetApiPolyhedriumData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/polyhedrium';
};
export type GetApiPolyhedriumErrors = {
    /**
     * Unauthorized
     */
    401: unknown;
};
export type GetApiPolyhedriumResponses = {
    /**
     * The balance
     */
    200: number;
};
export type GetApiPolyhedriumResponse = GetApiPolyhedriumResponses[keyof GetApiPolyhedriumResponses];
export type GetApiUserInfoData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/user-info';
};
export type GetApiUserInfoResponses = {
    /**
     * The user information
     */
    default: {
        tier?: {
            id?: string;
            name?: string | null;
        };
        sigils?: Array<{
            id?: string;
            name?: string;
            description?: string;
            imageUrl?: string;
            aura?: string;
        }>;
    };
};
export type GetApiUserInfoResponse = GetApiUserInfoResponses[keyof GetApiUserInfoResponses];
export type GetApiHubByFeatureData = {
    body?: never;
    path: {
        feature: string;
    };
    query?: never;
    url: '/api/_hub/{feature}';
};
export type GetApiHubByFeatureResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiHubData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub';
};
export type GetApiHubResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type HeadApiHubData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub';
};
export type HeadApiHubResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiHubManifestData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/manifest';
};
export type GetApiHubManifestResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type PostApiHubSyncVariablesData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/sync-variables';
};
export type PostApiHubSyncVariablesResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiHubOpenapiData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/openapi';
};
export type GetApiHubOpenapiResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type DeleteApiHubCacheByKeyData = {
    body?: never;
    path: {
        key: string;
    };
    query?: never;
    url: '/api/_hub/cache/{key}';
};
export type DeleteApiHubCacheByKeyResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiHubCacheByKeyData = {
    body?: never;
    path: {
        key: string;
    };
    query?: never;
    url: '/api/_hub/cache/{key}';
};
export type GetApiHubCacheByKeyResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type OptionsApiHubCacheByKeyData = {
    body?: never;
    path: {
        key: string;
    };
    query?: never;
    url: '/api/_hub/cache/{key}';
};
export type OptionsApiHubCacheByKeyResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type OptionsApiHubCacheBatchDeleteData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/cache/batch-delete';
};
export type OptionsApiHubCacheBatchDeleteResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type PostApiHubCacheBatchDeleteData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/cache/batch-delete';
};
export type PostApiHubCacheBatchDeleteResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type DeleteApiHubCacheClearByBaseData = {
    body?: never;
    path: {
        base: string;
    };
    query?: never;
    url: '/api/_hub/cache/clear/{base}';
};
export type DeleteApiHubCacheClearByBaseResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type OptionsApiHubCacheClearByBaseData = {
    body?: never;
    path: {
        base: string;
    };
    query?: never;
    url: '/api/_hub/cache/clear/{base}';
};
export type OptionsApiHubCacheClearByBaseResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiHubCacheData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/cache';
};
export type GetApiHubCacheResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type PostApiHubDatabaseByCommandData = {
    body?: never;
    path: {
        command: string;
    };
    query?: never;
    url: '/api/_hub/database/{command}';
};
export type PostApiHubDatabaseByCommandResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type OptionsApiHubDatabaseQueryData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/database/query';
};
export type OptionsApiHubDatabaseQueryResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type PostApiHubDatabaseQueryData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/database/query';
};
export type PostApiHubDatabaseQueryResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiHubKvByPathData = {
    body?: never;
    path: {
        path: string;
    };
    query?: never;
    url: '/api/_hub/kv/{path}';
};
export type GetApiHubKvByPathResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetNuxtErrorData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/__nuxt_error';
};
export type GetNuxtErrorResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetNuxtIslandBy__param1Data = {
    body?: never;
    path: {
        '*param1': string;
    };
    query?: never;
    url: '/__nuxt_island/{*param1}';
};
export type GetNuxtIslandBy__param1Responses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiHubOpenapiJsonData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/openapi.json';
};
export type GetApiHubOpenapiJsonResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type GetApiHubScalarData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/_hub/scalar';
};
export type GetApiHubScalarResponses = {
    /**
     * OK
     */
    200: unknown;
};
export type ClientOptions = {
    baseUrl: 'http://localhost' | (string & {});
};
