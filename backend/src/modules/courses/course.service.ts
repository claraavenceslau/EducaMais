import { CourseStatus, PointSource, Role } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../auth/AppError";
import type { CourseInput } from "./course.schemas";

function statusFromApi(status: CourseInput["status"]): CourseStatus {
  return status === "publicado" ? CourseStatus.PUBLISHED : CourseStatus.DRAFT;
}

function toCourseDto(
  course: {
    id: string;
    title: string;
    description: string;
    theme: string;
    level: string;
    status: CourseStatus;
    teacher: { name: string };
    lessons: { id: string; title: string; minutes: number }[];
    _count: { enrollments: number };
  },
  enrolled: boolean,
  completedLessonIds: Set<string>,
) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    theme: course.theme,
    level: course.level,
    teacher: course.teacher.name,
    rating: 0,
    enrolled,
    status: course.status === CourseStatus.PUBLISHED ? "publicado" as const : "rascunho" as const,
    students: course._count.enrollments,
    contentCreated: course.lessons.length ? 100 : 0,
    lessons: course.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      minutes: lesson.minutes,
      done: completedLessonIds.has(lesson.id),
    })),
  };
}

const courseInclude = {
  teacher: { select: { name: true } },
  lessons: { orderBy: { position: "asc" as const }, select: { id: true, title: true, minutes: true } },
  _count: { select: { enrollments: true } },
};

export const courseService = {
  async list(userId: string, role: Role) {
    const courses = await prisma.course.findMany({
      where: role === Role.TEACHER
        ? { teacherId: userId }
        : { status: CourseStatus.PUBLISHED },
      include: courseInclude,
      orderBy: [{ updatedAt: "desc" }],
    });

    if (role === Role.TEACHER) {
      return courses.map((course) => toCourseDto(course, false, new Set()));
    }

    const [enrollments, progress] = await Promise.all([
      prisma.enrollment.findMany({ where: { studentId: userId }, select: { courseId: true } }),
      prisma.lessonProgress.findMany({
        where: { studentId: userId, completedAt: { not: null } },
        select: { lessonId: true },
      }),
    ]);
    const enrolledCourses = new Set(enrollments.map((entry) => entry.courseId));
    const completedLessons = new Set(progress.map((entry) => entry.lessonId));
    return courses.map((course) => toCourseDto(course, enrolledCourses.has(course.id), completedLessons));
  },

  async create(teacherId: string, input: CourseInput) {
    const course = await prisma.course.create({
      data: {
        teacherId,
        title: input.title,
        description: input.description,
        theme: input.theme,
        level: input.level,
        status: statusFromApi(input.status),
        lessons: {
          create: input.lessons.map((lesson, position) => ({ title: lesson.title, minutes: lesson.minutes, position })),
        },
      },
      include: courseInclude,
    });
    return toCourseDto(course, false, new Set());
  },

  async update(teacherId: string, id: string, input: CourseInput) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.course.findFirst({
        where: { id, teacherId },
        select: { id: true, lessons: { select: { id: true } } },
      });
      if (!existing) throw new AppError(404, "COURSE_NOT_FOUND", "Curso não encontrado.");

      const existingLessonIds = new Set(existing.lessons.map((lesson) => lesson.id));
      const requestedIds = input.lessons.flatMap((lesson) => lesson.id ? [lesson.id] : []);
      if (requestedIds.some((lessonId) => !existingLessonIds.has(lessonId))) {
        throw new AppError(400, "INVALID_LESSON", "Uma das aulas informadas não pertence a este curso.");
      }

      const keptIds = new Set(requestedIds);
      const removedIds = [...existingLessonIds].filter((lessonId) => !keptIds.has(lessonId));
      if (removedIds.length) await tx.lesson.deleteMany({ where: { courseId: id, id: { in: removedIds } } });
      await tx.lesson.updateMany({ where: { courseId: id }, data: { position: { increment: 1000 } } });

      await tx.course.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description,
          theme: input.theme,
          level: input.level,
          status: statusFromApi(input.status),
        },
      });

      for (const [position, lesson] of input.lessons.entries()) {
        if (lesson.id) {
          await tx.lesson.update({ where: { id: lesson.id }, data: { title: lesson.title, minutes: lesson.minutes, position } });
        } else {
          await tx.lesson.create({ data: { courseId: id, title: lesson.title, minutes: lesson.minutes, position } });
        }
      }

      const course = await tx.course.findUniqueOrThrow({ where: { id }, include: courseInclude });
      return toCourseDto(course, false, new Set());
    });
  },

  async enroll(studentId: string, courseId: string) {
    const course = await prisma.course.findFirst({ where: { id: courseId, status: CourseStatus.PUBLISHED } });
    if (!course) throw new AppError(404, "COURSE_NOT_FOUND", "Curso publicado não encontrado.");

    await prisma.enrollment.upsert({
      where: { courseId_studentId: { courseId, studentId } },
      update: {},
      create: { courseId, studentId },
    });
    return this.getStudentCourse(studentId, courseId);
  },

  async toggleLesson(studentId: string, courseId: string, lessonId: string) {
    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: { courseId_studentId: { courseId, studentId } },
        select: { id: true },
      });
      if (!enrollment) throw new AppError(403, "COURSE_ENROLLMENT_REQUIRED", "Inscreva-se no curso para acompanhar as aulas.");

      const lesson = await tx.lesson.findFirst({ where: { id: lessonId, courseId }, select: { id: true } });
      if (!lesson) throw new AppError(404, "LESSON_NOT_FOUND", "Aula não encontrada.");

      const current = await tx.lessonProgress.findUnique({
        where: { lessonId_studentId: { lessonId, studentId } },
      });
      const completedAt = current?.completedAt ? null : new Date();
      await tx.lessonProgress.upsert({
        where: { lessonId_studentId: { lessonId, studentId } },
        update: { completedAt },
        create: { lessonId, studentId, completedAt },
      });

      if (completedAt) {
        const pointEvent = await tx.pointEvent.findUnique({
          where: { userId_source_sourceId: { userId: studentId, source: PointSource.LESSON, sourceId: lessonId } },
          select: { id: true },
        });
        if (!pointEvent) {
          await tx.pointEvent.create({ data: { userId: studentId, source: PointSource.LESSON, sourceId: lessonId, points: 20 } });
          await tx.user.update({ where: { id: studentId }, data: { totalPoints: { increment: 20 } } });
        }
      }

      const courseRecord = await tx.course.findUniqueOrThrow({ where: { id: courseId }, include: courseInclude });
      const progress = await tx.lessonProgress.findMany({
        where: { studentId, completedAt: { not: null }, lesson: { courseId } },
        select: { lessonId: true },
      });
      return toCourseDto(courseRecord, true, new Set(progress.map((entry) => entry.lessonId)));
    });
  },

  async getStudentCourse(studentId: string, courseId: string) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: CourseStatus.PUBLISHED },
      include: courseInclude,
    });
    if (!course) throw new AppError(404, "COURSE_NOT_FOUND", "Curso publicado não encontrado.");
    const progress = await prisma.lessonProgress.findMany({
      where: { studentId, completedAt: { not: null }, lesson: { courseId } },
      select: { lessonId: true },
    });
    return toCourseDto(course, true, new Set(progress.map((entry) => entry.lessonId)));
  },

  async gamification(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { totalPoints: true } });
    const ranking = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: { id: true, name: true, totalPoints: true },
      orderBy: [{ totalPoints: "desc" }, { createdAt: "asc" }],
      take: 10,
    });
    const [completedTasks, completedLessons, enrollments, events] = await Promise.all([
      prisma.task.count({ where: { userId, status: "COMPLETED" } }),
      prisma.lessonProgress.count({ where: { studentId: userId, completedAt: { not: null } } }),
      prisma.enrollment.count({ where: { studentId: userId } }),
      prisma.pointEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    ]);
    const studyDates = new Set(events.map((event) => event.createdAt.toISOString().slice(0, 10)));
    let streak = 0;
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    if (!studyDates.has(date.toISOString().slice(0, 10))) date.setUTCDate(date.getUTCDate() - 1);
    while (studyDates.has(date.toISOString().slice(0, 10))) {
      streak += 1;
      date.setUTCDate(date.getUTCDate() - 1);
    }

    const totalCompletions = completedTasks + completedLessons;
    const points = user.totalPoints;
    const firstRanked = ranking[0]?.id === userId;
    return {
      progress: { points, level: Math.floor(points / 300) + 1, xp: points % 300, xpNext: 300, streak },
      ranking: ranking.map((entry) => ({ name: entry.name, points: entry.totalPoints })),
      achievements: [
        { id: "first-task", title: "Primeiro Passo", description: "Completou a primeira tarefa", unlocked: completedTasks >= 1 },
        { id: "dedicated", title: "Estudante Dedicado", description: "Estudou por 7 dias consecutivos", unlocked: streak >= 7 },
        { id: "voice", title: "Voz Ativa", description: "Participou de 10 discussões", unlocked: false },
        { id: "focus", title: "Foco Total", description: "Concluiu 5 atividades", unlocked: totalCompletions >= 5 },
        { id: "accelerator", title: "Acelerador", description: "Concluiu 20 atividades", unlocked: totalCompletions >= 20 },
        { id: "elite", title: "Elite", description: "Alcançou o topo do ranking", unlocked: firstRanked },
      ],
      activity: [],
      enrolledCourseCount: enrollments,
    };
  },
};
