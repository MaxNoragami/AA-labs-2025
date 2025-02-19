using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;

namespace lab1.FibonacciImplementations
{
    public class Binet
    {
        static public BigInteger Fibonacci(long n)
        {
            // Golden ratio and negative counterpart
            double phi = (1 + Math.Sqrt(5)) / 2;
            double psi = (1 - Math.Sqrt(5)) / 2;

            return (BigInteger) Math.Round((Math.Pow(phi, n) - Math.Pow(psi, n)) / Math.Sqrt(5));
        }
    }
}