import { Request, Response, } from "express"

import { Workflow } from "../models/workflow.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"



export const createWorkflow = async (req: Request, res: Response): Promise<void> => {

    try {

        const { workflowname, description, nodes, edges } = req.body;

        if (
            !workflowname?.trim() ||
            !description?.trim() ||
            !Array.isArray(nodes) ||
            !Array.isArray(edges)
        ) {
            throw new ApiError(400, "All required fields must be provided");
        }


        if (!req.user) {
            throw new ApiError(401, "Unauthorized request")
        }

        const existingWorkflow = await Workflow.findOne({
            userId: req.user._id,
            workflowname: workflowname.trim(),
            isDeleted: false,
        });

        if (existingWorkflow) {
            throw new ApiError(409,
                "workflowname or node is already exists"
            )

        }


        const workflow = await Workflow.create({
            workflowname: workflowname.trim(),
            description: description.trim(),
            nodes,
            edges,
            userId: req.user._id,
        });



        res.status(201).json(
            new ApiResponse(
                201,
                workflow,
                 "Workflow created successfully",
            )
        )




    } catch (error) {
        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(500, "Something went wrong while creating workflow");

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });
    }
}


export const getWorkflow = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            throw new ApiError(
                400,
                "Unauthorized request"
            )

        }

        const workflow = await Workflow.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isDeleted: false
        })


        if (!workflow) {
            throw new ApiError(
                404,
                "workflow is not found"
            )
        }

        res.status(200).json(
            new ApiResponse(
                200,
                workflow,
                "Workflow fetched successfully",
            )
        );




    } catch (error) {

        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(500, "Something went wrong while fetching workflow");

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });

    }
}


export const getAllworkflow = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            throw new ApiError(
                400,
                "Unauthorized Request"
            )
        }

        const workflows = await Workflow.find({
            userId: req.user._id,
            isDeleted: false,
        }).sort({
            createdAt: -1
        })

        res.status(200).json(
            new ApiResponse(
                200,
                workflows,
                "workflows fetched successfully",
            )
        );

    } catch (error) {

        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(500, "Something went wrong while fetching workflows");

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });

    }
}

export const updateWorkflow = async (req: Request, res: Response) => {
    try {

        const { workflowname, description, nodes, edges } = req.body;

        if (
            workflowname === undefined &&
            description === undefined &&
            nodes === undefined &&
            edges === undefined
        ) {
            throw new ApiError(400, "At least one field is required");
        }

        if (!req.user) {
            throw new ApiError(401, "Unauthorized request")
        }


        const updatedWorkflow = await Workflow.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id,
            },
            {
                $set: {
                    workflowname,
                    description,
                    nodes,
                    edges,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedWorkflow) {
            throw new ApiError(404, "Workflow not found");
        }




        res.status(200).json(
            new ApiResponse(
                200,
                updatedWorkflow,
                "Workflow updated successfully",
            )
        );


    } catch (error) {

        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(500, "Something went wrong while updating workflow");

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });


    }
}

export const deleteWorkflow = async (req: Request, res: Response) => {
    try {


        if (!req.user) {
            throw new ApiError(
                400,
                "Unauthorized request"
            )
        }


        const workflow = await Workflow.findOne({
            _id: req.params.id,
            userId: req.user._id
        })

        if (!workflow) {
            throw new ApiError(
                404,
                "workflow not found"
            )
        }


        await Workflow.deleteOne({
            _id: workflow._id
        })


        res.status(200).json(
            new ApiResponse(
                200,
                workflow,
                "Workflow deleted successfully"
            )
        );




    } catch (error) {

        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(500, "Something went wrong while deleting workflow");

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });

    }

}


export const executeWorkflow = async ( req: Request,res: Response): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const workflow = await Workflow.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isDeleted: false,
        });

        if (!workflow) {
            throw new ApiError(404, "Workflow not found");
        }

        if (workflow.nodes.length === 0) {
            throw new ApiError(400, "Workflow has no nodes");
        }

        const triggerExists = workflow.nodes.some(
            (node: any) => node.type === "trigger"
        );

        if (!triggerExists) {
            throw new ApiError(400, "Workflow must have a trigger node");
        }

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    workflowId: workflow._id,
                    status: "pending",
                    message: "Workflow is ready for execution",
                },
                "Workflow execution request received successfully"
            )
        );
    } catch (error) {
        const apiError =
            error instanceof ApiError
                ? error
                : new ApiError(500, "Something went wrong while executing workflow");

        res.status(apiError.statusCode).json({
            statusCode: apiError.statusCode,
            message: apiError.message,
            success: false,
        });
    }
};


