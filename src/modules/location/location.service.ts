import { prisma } from "../../config/db";
import { AppError } from "../../middleware/error.middleware";

/**
 * 🌍 Validate hierarchy integrity
 */
export const validateLocationHierarchy = async ({
  stateId,
  districtId,
  cityId,
  villageId,
}: {
  stateId?: number;
  districtId?: number;
  cityId?: number;
  villageId?: number;
}) => {
  if (districtId) {
    const district = await prisma.district.findUnique({
      where: { id: districtId },
    });

    if (!district || district.stateId !== stateId) {
      throw new AppError("Invalid district for state", 400);
    }
  }

  if (cityId) {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city || city.districtId !== districtId) {
      throw new AppError("Invalid city for district", 400);
    }
  }

  if (villageId) {
    const village = await prisma.village.findUnique({
      where: { id: villageId },
    });

    if (!village || village.cityId !== cityId) {
      throw new AppError("Invalid village for city", 400);
    }
  }
};

/**
 * 👤 Assign location to user (handler restriction)
 */
export const assignUserLocation = async ({
  userId,
  location,
  creator,
}: {
  userId: string;
  location: any;
  creator: any;
}) => {
  // Handler can only assign within their location
  if (creator.role === "HANDLER") {
    if (creator.districtId !== location.districtId) {
      throw new AppError("Handler cannot assign outside district", 403);
    }
  }

  await validateLocationHierarchy(location);

  return prisma.user.update({
    where: { id: userId },
    data: location,
  });
};

/**
 * 📊 Get users by location (analytics)
 */
export const getUsersByLocation = async (filters: any) => {
  return prisma.user.findMany({
    where: {
      stateId: filters.stateId,
      districtId: filters.districtId,
      cityId: filters.cityId,
      villageId: filters.villageId,
    },
  });
};

/**
 * 🌍 Fetch full hierarchy
 */
export const getFullHierarchy = async () => {
  return prisma.state.findMany({
    include: {
      districts: {
        include: {
          cities: {
            include: {
              villages: true,
            },
          },
        },
      },
    },
  });
};