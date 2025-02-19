using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace lab1.FibonacciImplementations
{
    public class MatrixPower
    {
        static public long Fibonacci(long n)
        {
            // Deal with base case
            if(n <= 1) return n;

            // Initialize transformation matrix
            long[,] matrix1 = { {1, 1}, {1, 0} };

            // Raise matrix1 to power (n - 1)
            Power(matrix1, n - 1);

            // Result is in the top-left cell of the matrix
            return matrix1[0,0];
        }

        static private void Power(long[,] matrix1, long n)
        {
            // Base case
            if(n <= 1) return;

            // Initialize helper matrix
            long[,] matrix2 = { {1, 1}, {1, 0} };

            // Recursive calculate matrix1^(n / 2)
            Power(matrix1, n / 2);

            // We square matrix1
            Multiply(matrix1, matrix1);

            // If 'n' is odd, multiply by helper matrix2
            if(n % 2 !=0)
            {
                Multiply(matrix1, matrix2);
            }
        }

        static void Multiply(long[,] mat1, long[,] mat2)
        {
            // Do matrix multiplication
            long x = mat1[0,0] * mat2[0,0] + mat1[0,1] * mat2[1,0];
            long y = mat1[0,0] * mat2[0,1] + mat1[0,1] * mat2[1,1];
            long z = mat1[1,0] * mat2[0,0] + mat1[1,1] * mat2[1,0];
            long w = mat1[1,0] * mat2[0,1] + mat1[1,1] * mat2[1,1];

            // Update matrix mat1 with the result
            mat1[0,0] = x;
            mat1[0,1] = y;
            mat1[1,0] = z;
            mat1[1,1] = w;
        }
    }
}