import type { Options as ClientOptions, Client, TDataShape } from './client';
import type { GetData, GetResponses, GetApiAuthByAllData, GetApiAuthByAllResponses, PostApiDiscordInteractionsData, PostApiDiscordInteractionsResponses, PostApiForgeChatCompletionsData, PostApiForgeChatCompletionsResponses, GetApiForgeUsageData, GetApiForgeUsageResponses, GetApiListProductsData, GetApiListProductsResponses, GetApiPolyhedriumData, GetApiPolyhedriumResponses, GetApiPolyhedriumErrors, GetApiUserInfoData, GetApiUserInfoResponses, GetApiHubByFeatureData, GetApiHubByFeatureResponses, GetApiHubData, GetApiHubResponses, HeadApiHubData, HeadApiHubResponses, GetApiHubManifestData, GetApiHubManifestResponses, PostApiHubSyncVariablesData, PostApiHubSyncVariablesResponses, GetApiHubOpenapiData, GetApiHubOpenapiResponses, DeleteApiHubCacheByKeyData, DeleteApiHubCacheByKeyResponses, GetApiHubCacheByKeyData, GetApiHubCacheByKeyResponses, OptionsApiHubCacheByKeyData, OptionsApiHubCacheByKeyResponses, OptionsApiHubCacheBatchDeleteData, OptionsApiHubCacheBatchDeleteResponses, PostApiHubCacheBatchDeleteData, PostApiHubCacheBatchDeleteResponses, DeleteApiHubCacheClearByBaseData, DeleteApiHubCacheClearByBaseResponses, OptionsApiHubCacheClearByBaseData, OptionsApiHubCacheClearByBaseResponses, GetApiHubCacheData, GetApiHubCacheResponses, PostApiHubDatabaseByCommandData, PostApiHubDatabaseByCommandResponses, OptionsApiHubDatabaseQueryData, OptionsApiHubDatabaseQueryResponses, PostApiHubDatabaseQueryData, PostApiHubDatabaseQueryResponses, GetApiHubKvByPathData, GetApiHubKvByPathResponses, GetNuxtErrorData, GetNuxtErrorResponses, GetNuxtIslandBy__param1Data, GetNuxtIslandBy__param1Responses, GetApiHubOpenapiJsonData, GetApiHubOpenapiJsonResponses, GetApiHubScalarData, GetApiHubScalarResponses } from './types.gen';
export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: Record<string, unknown>;
};
export declare const get: <ThrowOnError extends boolean = false>(options?: Options<GetData, ThrowOnError>) => import("./client").RequestResult<GetResponses, unknown, ThrowOnError, "fields">;
export declare const getApiAuthByAll: <ThrowOnError extends boolean = false>(options: Options<GetApiAuthByAllData, ThrowOnError>) => import("./client").RequestResult<GetApiAuthByAllResponses, unknown, ThrowOnError, "fields">;
export declare const postApiDiscordInteractions: <ThrowOnError extends boolean = false>(options?: Options<PostApiDiscordInteractionsData, ThrowOnError>) => import("./client").RequestResult<PostApiDiscordInteractionsResponses, unknown, ThrowOnError, "fields">;
export declare const postApiForgeChatCompletions: <ThrowOnError extends boolean = false>(options?: Options<PostApiForgeChatCompletionsData, ThrowOnError>) => import("./client").RequestResult<PostApiForgeChatCompletionsResponses, unknown, ThrowOnError, "fields">;
export declare const getApiForgeUsage: <ThrowOnError extends boolean = false>(options?: Options<GetApiForgeUsageData, ThrowOnError>) => import("./client").RequestResult<GetApiForgeUsageResponses, unknown, ThrowOnError, "fields">;
export declare const getApiListProducts: <ThrowOnError extends boolean = false>(options?: Options<GetApiListProductsData, ThrowOnError>) => import("./client").RequestResult<GetApiListProductsResponses, unknown, ThrowOnError, "fields">;
/**
 * Get the polyhedrium balance of the authenticated user
 */
export declare const getApiPolyhedrium: <ThrowOnError extends boolean = false>(options?: Options<GetApiPolyhedriumData, ThrowOnError>) => import("./client").RequestResult<GetApiPolyhedriumResponses, GetApiPolyhedriumErrors, ThrowOnError, "fields">;
/**
 * Get information about the authenticated user
 */
export declare const getApiUserInfo: <ThrowOnError extends boolean = false>(options?: Options<GetApiUserInfoData, ThrowOnError>) => import("./client").RequestResult<GetApiUserInfoResponses, unknown, ThrowOnError, "fields">;
export declare const getApiHubByFeature: <ThrowOnError extends boolean = false>(options: Options<GetApiHubByFeatureData, ThrowOnError>) => import("./client").RequestResult<GetApiHubByFeatureResponses, unknown, ThrowOnError, "fields">;
export declare const getApiHub: <ThrowOnError extends boolean = false>(options?: Options<GetApiHubData, ThrowOnError>) => import("./client").RequestResult<GetApiHubResponses, unknown, ThrowOnError, "fields">;
export declare const headApiHub: <ThrowOnError extends boolean = false>(options?: Options<HeadApiHubData, ThrowOnError>) => import("./client").RequestResult<HeadApiHubResponses, unknown, ThrowOnError, "fields">;
export declare const getApiHubManifest: <ThrowOnError extends boolean = false>(options?: Options<GetApiHubManifestData, ThrowOnError>) => import("./client").RequestResult<GetApiHubManifestResponses, unknown, ThrowOnError, "fields">;
export declare const postApiHubSyncVariables: <ThrowOnError extends boolean = false>(options?: Options<PostApiHubSyncVariablesData, ThrowOnError>) => import("./client").RequestResult<PostApiHubSyncVariablesResponses, unknown, ThrowOnError, "fields">;
export declare const getApiHubOpenapi: <ThrowOnError extends boolean = false>(options?: Options<GetApiHubOpenapiData, ThrowOnError>) => import("./client").RequestResult<GetApiHubOpenapiResponses, unknown, ThrowOnError, "fields">;
export declare const deleteApiHubCacheByKey: <ThrowOnError extends boolean = false>(options: Options<DeleteApiHubCacheByKeyData, ThrowOnError>) => import("./client").RequestResult<DeleteApiHubCacheByKeyResponses, unknown, ThrowOnError, "fields">;
export declare const getApiHubCacheByKey: <ThrowOnError extends boolean = false>(options: Options<GetApiHubCacheByKeyData, ThrowOnError>) => import("./client").RequestResult<GetApiHubCacheByKeyResponses, unknown, ThrowOnError, "fields">;
export declare const optionsApiHubCacheByKey: <ThrowOnError extends boolean = false>(options: Options<OptionsApiHubCacheByKeyData, ThrowOnError>) => import("./client").RequestResult<OptionsApiHubCacheByKeyResponses, unknown, ThrowOnError, "fields">;
export declare const optionsApiHubCacheBatchDelete: <ThrowOnError extends boolean = false>(options?: Options<OptionsApiHubCacheBatchDeleteData, ThrowOnError>) => import("./client").RequestResult<OptionsApiHubCacheBatchDeleteResponses, unknown, ThrowOnError, "fields">;
export declare const postApiHubCacheBatchDelete: <ThrowOnError extends boolean = false>(options?: Options<PostApiHubCacheBatchDeleteData, ThrowOnError>) => import("./client").RequestResult<PostApiHubCacheBatchDeleteResponses, unknown, ThrowOnError, "fields">;
export declare const deleteApiHubCacheClearByBase: <ThrowOnError extends boolean = false>(options: Options<DeleteApiHubCacheClearByBaseData, ThrowOnError>) => import("./client").RequestResult<DeleteApiHubCacheClearByBaseResponses, unknown, ThrowOnError, "fields">;
export declare const optionsApiHubCacheClearByBase: <ThrowOnError extends boolean = false>(options: Options<OptionsApiHubCacheClearByBaseData, ThrowOnError>) => import("./client").RequestResult<OptionsApiHubCacheClearByBaseResponses, unknown, ThrowOnError, "fields">;
export declare const getApiHubCache: <ThrowOnError extends boolean = false>(options?: Options<GetApiHubCacheData, ThrowOnError>) => import("./client").RequestResult<GetApiHubCacheResponses, unknown, ThrowOnError, "fields">;
export declare const postApiHubDatabaseByCommand: <ThrowOnError extends boolean = false>(options: Options<PostApiHubDatabaseByCommandData, ThrowOnError>) => import("./client").RequestResult<PostApiHubDatabaseByCommandResponses, unknown, ThrowOnError, "fields">;
export declare const optionsApiHubDatabaseQuery: <ThrowOnError extends boolean = false>(options?: Options<OptionsApiHubDatabaseQueryData, ThrowOnError>) => import("./client").RequestResult<OptionsApiHubDatabaseQueryResponses, unknown, ThrowOnError, "fields">;
export declare const postApiHubDatabaseQuery: <ThrowOnError extends boolean = false>(options?: Options<PostApiHubDatabaseQueryData, ThrowOnError>) => import("./client").RequestResult<PostApiHubDatabaseQueryResponses, unknown, ThrowOnError, "fields">;
export declare const getApiHubKvByPath: <ThrowOnError extends boolean = false>(options: Options<GetApiHubKvByPathData, ThrowOnError>) => import("./client").RequestResult<GetApiHubKvByPathResponses, unknown, ThrowOnError, "fields">;
export declare const getNuxtError: <ThrowOnError extends boolean = false>(options?: Options<GetNuxtErrorData, ThrowOnError>) => import("./client").RequestResult<GetNuxtErrorResponses, unknown, ThrowOnError, "fields">;
export declare const getNuxtIslandBy__param1: <ThrowOnError extends boolean = false>(options: Options<GetNuxtIslandBy__param1Data, ThrowOnError>) => import("./client").RequestResult<GetNuxtIslandBy__param1Responses, unknown, ThrowOnError, "fields">;
export declare const getApiHubOpenapiJson: <ThrowOnError extends boolean = false>(options?: Options<GetApiHubOpenapiJsonData, ThrowOnError>) => import("./client").RequestResult<GetApiHubOpenapiJsonResponses, unknown, ThrowOnError, "fields">;
export declare const getApiHubScalar: <ThrowOnError extends boolean = false>(options?: Options<GetApiHubScalarData, ThrowOnError>) => import("./client").RequestResult<GetApiHubScalarResponses, unknown, ThrowOnError, "fields">;
