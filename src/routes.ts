/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { InvoicesController } from './controllers/invoices.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HealthController } from './controllers/hello.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "APIInvoice": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "accountId": {"dataType":"string","required":true},
            "customerId": {"dataType":"string","required":true},
            "priceBreakdown": {"dataType":"double","required":true},
            "products": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"units":{"dataType":"double","required":true},"price":{"dataType":"double","required":true},"id":{"dataType":"string","required":true}}},"required":true},
            "billingPeriod": {"dataType":"nestedObjectLiteral","nestedProperties":{"endTime":{"dataType":"date","required":true},"startTime":{"dataType":"date","required":true}},"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateInvoicePayload": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "accountId": {"dataType":"string","required":true},
            "customerId": {"dataType":"string","required":true},
            "priceBreakdown": {"dataType":"double","required":true},
            "products": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"units":{"dataType":"double","required":true},"price":{"dataType":"double","required":true},"id":{"dataType":"string","required":true}}},"required":true},
            "billingPeriod": {"dataType":"nestedObjectLiteral","nestedProperties":{"endTime":{"dataType":"datetime","required":true},"startTime":{"dataType":"datetime","required":true}},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateInvoicePayload": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "customerId": {"dataType":"string"},
            "products": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"units":{"dataType":"double","required":true},"price":{"dataType":"double","required":true},"id":{"dataType":"string","required":true}}}},
            "billingPeriod": {"dataType":"nestedObjectLiteral","nestedProperties":{"endTime":{"dataType":"datetime","required":true},"startTime":{"dataType":"datetime","required":true}}},
            "priceBreakdown": {"dataType":"double"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QueryResult_APIInvoice_": {
        "dataType": "refObject",
        "properties": {
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"APIInvoice"},"required":true},
            "totalCount": {"dataType":"integer","required":true},
            "hasMore": {"dataType":"boolean","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "APIQueryPayload_APIInvoice_": {
        "dataType": "refObject",
        "properties": {
            "filter": {"dataType":"nestedObjectLiteral","nestedProperties":{},"required":true},
            "page": {"dataType":"integer","default":0,"validators":{"minimum":{"value":0}}},
            "pageSize": {"dataType":"integer","default":100,"validators":{"minimum":{"value":0}}},
            "sort": {"dataType":"nestedObjectLiteral","nestedProperties":{}},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"ignore","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        app.get('/api/invoices/:id/Calculate',
            ...(fetchMiddlewares<RequestHandler>(InvoicesController)),
            ...(fetchMiddlewares<RequestHandler>(InvoicesController.prototype.calculate)),

            async function InvoicesController_calculate(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new InvoicesController();

              await templateService.apiHandler({
                methodName: 'calculate',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/invoices/:id',
            ...(fetchMiddlewares<RequestHandler>(InvoicesController)),
            ...(fetchMiddlewares<RequestHandler>(InvoicesController.prototype.get)),

            async function InvoicesController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new InvoicesController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoices',
            ...(fetchMiddlewares<RequestHandler>(InvoicesController)),
            ...(fetchMiddlewares<RequestHandler>(InvoicesController.prototype.create)),

            async function InvoicesController_create(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    invoice: {"in":"body","name":"invoice","required":true,"ref":"CreateInvoicePayload"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new InvoicesController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/api/invoices/:id',
            ...(fetchMiddlewares<RequestHandler>(InvoicesController)),
            ...(fetchMiddlewares<RequestHandler>(InvoicesController.prototype.update)),

            async function InvoicesController_update(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    invoice: {"in":"body","name":"invoice","required":true,"ref":"UpdateInvoicePayload"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new InvoicesController();

              await templateService.apiHandler({
                methodName: 'update',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/invoices/:id',
            ...(fetchMiddlewares<RequestHandler>(InvoicesController)),
            ...(fetchMiddlewares<RequestHandler>(InvoicesController.prototype.delete)),

            async function InvoicesController_delete(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new InvoicesController();

              await templateService.apiHandler({
                methodName: 'delete',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/invoices/query',
            ...(fetchMiddlewares<RequestHandler>(InvoicesController)),
            ...(fetchMiddlewares<RequestHandler>(InvoicesController.prototype.query)),

            async function InvoicesController_query(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    payload: {"in":"body","name":"payload","required":true,"ref":"APIQueryPayload_APIInvoice_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new InvoicesController();

              await templateService.apiHandler({
                methodName: 'query',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/health',
            ...(fetchMiddlewares<RequestHandler>(HealthController)),
            ...(fetchMiddlewares<RequestHandler>(HealthController.prototype.health)),

            async function HealthController_health(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new HealthController();

              await templateService.apiHandler({
                methodName: 'health',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
