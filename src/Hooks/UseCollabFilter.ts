import { TutorRatingsModel } from "../Models/TutorRatingModel";

const PearsonCorrelation = (
  data_set_A: Array<number>,
  data_set_B: Array<number>
) => {
  let numer = SumProductMeanDeviation(data_set_A, data_set_B);
  let denomer = ProductSumSquareMeanDeviation(data_set_A, data_set_B);

  let correlation = numer / denomer;

  if (!correlation || isNaN(correlation)) {
    return -1;
  } else {
    return correlation;
  }
};

const SumProductMeanDeviation = (
  data_set_A: Array<number>,
  data_set_B: Array<number>
) => {
  let sum = 0;

  for (let i = 0; i < data_set_A.length; i++) {
    if (data_set_A[i] != 0 && data_set_B[i] != 0) {
      sum += ProductMeanDeviation(data_set_A, data_set_B, i);
    }
  }

  return sum;
};

const ProductMeanDeviation = (
  data_set_A: Array<number>,
  data_set_B: Array<number>,
  index: number
) => {
  const mean_dev_set_a = MeanDeviation(data_set_A, index);
  const mean_dev_set_b = MeanDeviation(data_set_B, index);
  const prod_mean_dev = mean_dev_set_a * mean_dev_set_b;

  return prod_mean_dev;
};

const MeanDeviation = (data_set: Array<number>, index: number) => {
  const average = Average(data_set);
  return data_set[index] - average;
};

const Average = (data_set: Array<number>) => {
  let sum = 0;
  let len = 0;

  for (let i = 0; i < data_set.length; i++) {
    if (data_set[i] != 0) {
      sum += data_set[i];
      len++;
    }
  }

  return sum / len;
};

//--------------
const ProductSumSquareMeanDeviation = (
  data_set_A: Array<number>,
  data_set_B: Array<number>
): number => {
  const data_set_a_res = SumSquareMeanDeviation(data_set_A);
  const data_set_b_res = SumSquareMeanDeviation(data_set_B);

  const product = data_set_a_res * data_set_b_res;
  if (product == 0) {
    return -1;
  } else {
    return product;
  }
};

const SumSquareMeanDeviation = (data_set: Array<number>): number => {
  let sum = 0;

  for (let i = 0; i < data_set.length; i++) {
    if (data_set[i] != 0) {
      sum = sum + SquareMeanDeviation(data_set, i);
    }
  }

  return Math.sqrt(sum);

  // return sum;
};

export const GeneralWeightedAverage = (data_set: Array<any>) => {
  let sum_prod_score_rating = 0;
  let sum_sim_scores = 0;

  for (let i = 0; i < data_set.length; i++) {
    if (data_set[i].sim_score > 0) {
      const prod_score_rating = data_set[i].sim_score * data_set[i].rating;
      const sim_scores = data_set[i].sim_score;
      sum_prod_score_rating += prod_score_rating;
      sum_sim_scores += sim_scores;
    }
  }

  const result = sum_prod_score_rating / sum_sim_scores;

  return isNaN(result) ? 0 : result;
};

const SquareMeanDeviation = (
  data_set: Array<number>,
  index: number
): number => {
  const mean_dev_result = MeanDeviation(data_set, index);
  return mean_dev_result * mean_dev_result;
};

const EuclideanDistance = (sim_core: number, rating: number) => {
  const diff_sim_rating = sim_core - 1;
  const diff_rating = rating - 2.5;

  const square_sim_rating = Math.pow(diff_sim_rating, 2);
  const square_diff_rating = Math.pow(diff_rating, 2);

  const sum_squares = square_sim_rating + square_diff_rating;

  const result = Math.sqrt(sum_squares);

  return result;
};

const RatingPrediction = async (
  tutor_pk: number,
  tutors: Array<TutorRatingsModel>,
  students: Array<TutorRatingsModel>,
  ratings: Array<TutorRatingsModel>,
  student_ratings: Array<TutorRatingsModel>
) => {
  const data_set = [];
  const tutor_sim_scores = [];

  //mark sunner - nhordz = .87
  //mark sunner - bazar = .3

  for (const t of tutors) {
    const student_tutor_ratings = [];

    for (const s of students) {
      const found_index = ratings.findIndex(
        (r) => r.student_pk === s.student_pk && t.tutor_pk === r.tutor_pk
      );

      student_tutor_ratings.push({
        student_pk: s.student_pk,
        rating: !!ratings[found_index]?.rating
          ? ratings[found_index].rating
          : 0,
      });
    }

    data_set.push({
      tutor: t.tutor_pk,
      students: student_tutor_ratings,
    });
  }

  const index_tutor_to_compare = data_set.findIndex(
    (d) => d.tutor === tutor_pk
  );

  if (index_tutor_to_compare !== -1) {
    const compare_tutor_ratings = data_set[index_tutor_to_compare].students.map(
      (v: any) => v.rating
    );

    for (let i = 0; i < data_set.length; i++) {
      if (i !== index_tutor_to_compare) {
        const other_tutor_ratings = data_set[i].students.map(
          (v: any) => v.rating
        );

        //marksunner - nhordz

        const sim_score = PearsonCorrelation(
          other_tutor_ratings,
          compare_tutor_ratings
        );

        // console.log(`sim score`, sim_score);

        tutor_sim_scores.push(sim_score);
      }
    }

    // console.log(`tutor_sim_scores`, tutor_sim_scores);

    const pcc_data_set = [];
    for (let i = 0; i < student_ratings.length; i++) {
      for (let x = 0; x < data_set.length; x++) {
        if (student_ratings[i].tutor_pk === data_set[x].tutor) {
          pcc_data_set.push({
            sim_score: tutor_sim_scores[x],
            rating: student_ratings[i].rating,
            distance: EuclideanDistance(
              tutor_sim_scores[x],
              student_ratings[i].rating
            ),
          });
        }
      }
    }

    return GeneralWeightedAverage(pcc_data_set);
  } else {
    return 0;
  }
};

export default {
  PearsonCorrelation,
  EuclideanDistance,
  GeneralWeightedAverage,
  RatingPrediction,
};
