import mongoose from "mongoose";
import {
  FACULTY_DESIGNATIONS,
  MAX_SPECIALIZATIONS,
} from "../../config/constants.js";

const facultySchema = new mongoose.Schema(
  {
    // ... (الحقول الأساسية مثل Admin)
    academicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    designation: {
      type: String,
      enum: FACULTY_DESIGNATIONS,
      required: [true, "المسمى الوظيفي مطلوب"],
    },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: function () {
        return this.role === "faculty";
      },
    },
    specialization: {
      type: [String],
      validate: {
        validator: function (specs) {
          return specs.length <= MAX_SPECIALIZATIONS;
        },
        message: `لا يمكن إضافة أكثر من ${MAX_SPECIALIZATIONS} تخصصات`,
      },
    },
    nfcCard: {
      serialNumber: {
        type: String,
        unique: true,
        sparse: true,
        immutable: true,
      },
      expiryDate: {
        type: Date,
        validate: {
          validator: function (date) {
            return date > new Date();
          },
          message: "تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل",
        },
      },
    },
  },
  { timestamps: true }
);

// Middlewares for password hashing
facultySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

facultySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for getting faculty's sections
facultySchema.virtual("sections", {
  ref: "Section",
  localField: "_id",
  foreignField: "faculty",
});

export const Faculty = mongoose.model("Faculty", facultySchema);
