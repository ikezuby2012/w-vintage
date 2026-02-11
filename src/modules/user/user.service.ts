
import httpStatus from "http-status";
import mongoose from "mongoose";
import User from "./user.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
  NewCreatedUser,
  UpdateUserBody,
  IUserDoc,
  NewRegisteredUser,
} from "./user.interfaces";

/**
 * Create a user
 * @param {NewCreatedUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (
  userBody: NewCreatedUser
): Promise<IUserDoc> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return User.create(userBody);
};

/**
 * Register a user
 * @param {NewRegisteredUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const registerUser = async (
  userBody: NewRegisteredUser
): Promise<IUserDoc> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryUsers = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserById = async (
  id: mongoose.Types.ObjectId
): Promise<IUserDoc | null> => User.findById(id);

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserByEmail = async (email: string): Promise<IUserDoc | null> =>
  User.findOne({ email });

/**
 * Update user by id
 * @param {mongoose.Types.ObjectId} userId
 * @param {UpdateUserBody} updateBody
 * @returns {Promise<IUserDoc | null>}
 */
export const updateUserById = async (
  userId: mongoose.Types.ObjectId,
  updateBody: UpdateUserBody
): Promise<IUserDoc | null> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  // Object.assign(user, updateBody);
  // await user.save();
  // return user;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateBody,
    {
      new: true,
      runValidators: true,
    }
  );

  return updatedUser;
};

/**
 * Delete user by id
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<IUserDoc | null>}
 */
export const deleteUserById = async (
  userId: mongoose.Types.ObjectId
): Promise<IUserDoc | null> => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

export const GetUsersCount = () => User.countDocuments();

// Function to generate unique 12-digit account number using timestamp
export const generateAccountNumber = (): string => {
  // 1. Get current timestamp in seconds (currently 10 digits)
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // 2. Calculate how many digits we need to reach 12
  const targetLength = 12;
  const remainingDigits = targetLength - timestamp.length;

  if (remainingDigits > 0) {
    // 3. Generate exactly the number of random digits needed
    const randomPart = Math.floor(Math.random() * Math.pow(10, remainingDigits))
      .toString()
      .padStart(remainingDigits, '0');

    return timestamp + randomPart;
  }

  // 4. Fallback: If timestamp is already 12+ digits, truncate it
  return timestamp.slice(0, targetLength);
};

// Example Output: "171630124582"
