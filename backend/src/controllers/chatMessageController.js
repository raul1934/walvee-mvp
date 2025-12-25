const { ChatMessage, Trip, City } = require("../models/sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

// POST /chat-messages - Create single message
const createMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      trip_id,
      role,
      content,
      recommendations = null,
      city_context = null,
      timestamp = new Date(),
    } = req.body;

    // Verify trip ownership
    const trip = await Trip.findOne({
      where: { id: trip_id, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "Trip not found or unauthorized")
        );
    }

    // Create message
    const message = await ChatMessage.create({
      id: uuidv4(),
      trip_id,
      role,
      content,
      recommendations,
      city_context,
      timestamp,
    });

    // Return the created message inside `data` for consistent client consumption
    return res.status(201).json(buildSuccessResponse({ message }));
  } catch (error) {
    next(error);
  }
};

// POST /chat-messages/bulk - Bulk create messages
const bulkCreateMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { trip_id, messages } = req.body;

    // Verify trip ownership
    const trip = await Trip.findOne({
      where: { id: trip_id, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "Trip not found or unauthorized")
        );
    }

    // Add trip_id and id to all messages
    const messagesWithTripId = messages.map((msg) => ({
      ...msg,
      id: uuidv4(),
      trip_id,
      timestamp: msg.timestamp || new Date(),
    }));

    // Bulk insert
    const createdMessages = await ChatMessage.bulkCreate(messagesWithTripId);

    // Return the created messages inside `data` for consistent client consumption
    return res
      .status(201)
      .json(
        buildSuccessResponse({
          messages: createdMessages,
          meta: { count: createdMessages.length },
        })
      );
  } catch (error) {
    next(error);
  }
};

// GET /chat-messages/:tripId - Get messages for trip
const getMessagesByTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
      const { tripId } = req.params;
    const { city_context } = req.query;

    // Verify trip ownership
    const trip = await Trip.findOne({
      where: { id: tripId, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "Trip not found or unauthorized")
        );
    }

    // Build query
    const where = { trip_id: tripId };

    // Support flexible city_context lookup: accept either city name or city id (UUID)
    if (city_context !== undefined) {
      // If the provided context looks like a UUID, also attempt to resolve the city's name
      const isUuid = typeof city_context === "string" && /^[0-9a-fA-F\-]{36}$/.test(city_context);

      if (isUuid) {
        // Try to find the city by id
        const cityRecord = await City.findByPk(city_context, { attributes: ["name"] });

        // If found, match messages where city_context equals the id OR equals the city's name
        if (cityRecord && cityRecord.name) {
          where[Op.or] = [{ city_context: city_context }, { city_context: cityRecord.name }];
        } else {
          where.city_context = city_context;
        }
      } else {
        where.city_context = city_context;
      }
    }

    const messages = await ChatMessage.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    // Return messages inside `data` so clients can access `response.data.messages`
    return res.json(buildSuccessResponse({ messages }));
  } catch (error) {
    next(error);
  }
};

// DELETE /chat-messages/:tripId - Delete all messages for trip
const deleteMessagesByTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    // Verify trip ownership
    const trip = await Trip.findOne({
      where: { id: tripId, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "Trip not found or unauthorized")
        );
    }

    const deleted = await ChatMessage.destroy({
      where: { trip_id: tripId },
    });

    // Return deleted count inside `data` so clients can access `response.data.deleted`
    return res.json(buildSuccessResponse({ deleted }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  bulkCreateMessages,
  getMessagesByTrip,
  deleteMessagesByTrip,
};
